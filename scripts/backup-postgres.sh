#!/bin/bash
# Backup automatise PostgreSQL avec rotation et retention
# Usage : ./scripts/backup-postgres.sh [--upload-s3]
#
# Variables d'environnement requises :
#   POSTGRES_USER, POSTGRES_DB (ou valeurs par defaut)
#
# Variables optionnelles pour S3 :
#   S3_BUCKET, S3_PREFIX, AWS_PROFILE
#
# Cron recommande (tous les jours a 3h) :
#   0 3 * * * cd /path/to/project && ./scripts/backup-postgres.sh >> /var/log/kickstarter-backup.log 2>&1

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
POSTGRES_USER="${POSTGRES_USER:-kickstarter}"
POSTGRES_DB="${POSTGRES_DB:-kickstarter}"
CONTAINER_NAME="${CONTAINER_NAME:-kickstarter-database-prod}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${POSTGRES_DB}_${TIMESTAMP}.sql.gz"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${RED}[ERROR]${NC} $1"
}

# Creation du repertoire de backup
mkdir -p "${BACKUP_DIR}"

# Verification que le container PostgreSQL tourne
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_error "Le container ${CONTAINER_NAME} n'est pas en cours d'execution."
    exit 1
fi

# Backup compresse
log_info "Debut du backup de la base '${POSTGRES_DB}'..."
docker exec "${CONTAINER_NAME}" pg_dump \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --format=plain \
    --no-owner \
    --no-privileges \
    | gzip > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log_info "Backup cree : ${BACKUP_FILE} (${BACKUP_SIZE})"

# Verification de l'integrite du backup
if ! gzip -t "${BACKUP_FILE}" 2>/dev/null; then
    log_error "Le fichier de backup est corrompu : ${BACKUP_FILE}"
    rm -f "${BACKUP_FILE}"
    exit 1
fi
log_info "Verification d'integrite : OK"

# Rotation : suppression des backups plus anciens que RETENTION_DAYS jours
DELETED_COUNT=0
if [ -d "${BACKUP_DIR}" ]; then
    while IFS= read -r old_backup; do
        rm -f "${old_backup}"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    done < <(find "${BACKUP_DIR}" -name "${POSTGRES_DB}_*.sql.gz" -mtime +"${RETENTION_DAYS}" -type f 2>/dev/null)
fi

if [ "${DELETED_COUNT}" -gt 0 ]; then
    log_info "Rotation : ${DELETED_COUNT} ancien(s) backup(s) supprime(s) (retention ${RETENTION_DAYS} jours)."
fi

# Upload S3 optionnel
if [ "${1:-}" = "--upload-s3" ]; then
    S3_BUCKET="${S3_BUCKET:-}"
    S3_PREFIX="${S3_PREFIX:-backups/postgres}"

    if [ -z "${S3_BUCKET}" ]; then
        log_error "Variable S3_BUCKET non definie. Upload S3 ignore."
        exit 1
    fi

    S3_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/$(basename "${BACKUP_FILE}")"
    log_info "Upload vers ${S3_PATH}..."

    if command -v aws &>/dev/null; then
        aws s3 cp "${BACKUP_FILE}" "${S3_PATH}" --storage-class STANDARD_IA
        log_info "Upload S3 termine."
    elif command -v s3cmd &>/dev/null; then
        s3cmd put "${BACKUP_FILE}" "${S3_PATH}"
        log_info "Upload S3 termine (s3cmd)."
    else
        log_error "Aucun client S3 installe (aws-cli ou s3cmd). Upload ignore."
        exit 1
    fi
fi

# Resume
TOTAL_BACKUPS=$(find "${BACKUP_DIR}" -name "${POSTGRES_DB}_*.sql.gz" -type f 2>/dev/null | wc -l)
log_info "Backup termine. Total : ${TOTAL_BACKUPS} backup(s) conserve(s)."
