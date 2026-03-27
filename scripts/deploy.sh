#!/bin/bash
# Script de deploiement zero-downtime avec rollback automatique
# Usage : ./scripts/deploy.sh [--no-backup] [--skip-tests]
#
# Le script :
# 1. Cree un backup de la base de donnees
# 2. Pull les nouvelles images / rebuild
# 3. Execute les migrations Doctrine
# 4. Redemarre les services un par un (rolling update)
# 5. Execute un smoke test post-deploiement
# 6. Rollback automatique en cas d'echec

set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yaml"
COMPOSE_CMD="docker compose -f ${COMPOSE_FILE}"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SKIP_BACKUP=false
SKIP_TESTS=false
ROLLBACK_BACKUP=""

for arg in "$@"; do
    case $arg in
        --no-backup) SKIP_BACKUP=true ;;
        --skip-tests) SKIP_TESTS=true ;;
    esac
done

log_step() {
    echo ""
    echo -e "${BLUE}=== $1 ===${NC}"
}

log_info() {
    echo -e "[$(date '+%H:%M:%S')] ${GREEN}[OK]${NC} $1"
}

log_error() {
    echo -e "[$(date '+%H:%M:%S')] ${RED}[ERREUR]${NC} $1"
}

rollback() {
    log_error "Deploiement echoue. Rollback en cours..."

    # Restauration du backup si disponible
    if [ -n "${ROLLBACK_BACKUP}" ] && [ -f "${ROLLBACK_BACKUP}" ]; then
        log_step "Restauration de la base de donnees"
        POSTGRES_USER="${POSTGRES_USER:-kickstarter}" \
        POSTGRES_DB="${POSTGRES_DB:-kickstarter}" \
        bash -c "echo 'oui' | ${SCRIPTS_DIR}/restore-postgres.sh ${ROLLBACK_BACKUP}"
        log_info "Base de donnees restauree."
    fi

    # Redemarrage des anciens containers
    log_step "Redemarrage des services"
    ${COMPOSE_CMD} up -d
    log_info "Services redemarres."

    echo ""
    echo -e "${RED}Le deploiement a echoue et a ete annule.${NC}"
    echo "Verifier les logs : ${COMPOSE_CMD} logs"
    exit 1
}

trap rollback ERR

echo -e "${GREEN}Deploiement Symfony Kickstarter${NC}"
echo "$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Etape 1 : Backup
if [ "${SKIP_BACKUP}" = false ]; then
    log_step "Etape 1/5 : Backup de la base de donnees"
    bash "${SCRIPTS_DIR}/backup-postgres.sh"
    ROLLBACK_BACKUP=$(ls -t backups/*.sql.gz 2>/dev/null | head -1)
    log_info "Backup cree : ${ROLLBACK_BACKUP}"
else
    log_step "Etape 1/5 : Backup ignore (--no-backup)"
fi

# Etape 2 : Build des images
log_step "Etape 2/5 : Build des images de production"
${COMPOSE_CMD} build --no-cache php
log_info "Image PHP reconstruite."

# Etape 3 : Migrations
log_step "Etape 3/5 : Migrations de la base de donnees"
${COMPOSE_CMD} run --rm php php bin/console doctrine:migrations:status --no-interaction
PENDING=$(${COMPOSE_CMD} run --rm php php bin/console doctrine:migrations:status --no-interaction 2>&1 | grep -c "not migrated" || true)
if [ "${PENDING}" -gt 0 ]; then
    ${COMPOSE_CMD} run --rm php php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration
    log_info "${PENDING} migration(s) executee(s)."
else
    log_info "Aucune migration en attente."
fi

# Etape 4 : Redemarrage des services (rolling update)
log_step "Etape 4/5 : Redemarrage des services"
${COMPOSE_CMD} up -d --no-deps database redis
sleep 5
${COMPOSE_CMD} up -d --no-deps php
sleep 10
${COMPOSE_CMD} up -d --no-deps nginx
log_info "Tous les services sont redemarres."

# Etape 5 : Smoke test
log_step "Etape 5/5 : Verification post-deploiement"
sleep 5

if [ "${SKIP_TESTS}" = false ]; then
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${NGINX_PORT:-80}/api/healthcheck 2>/dev/null || echo "000")
    if [ "${HEALTH_STATUS}" = "200" ]; then
        log_info "Healthcheck : OK (HTTP ${HEALTH_STATUS})"
    else
        log_error "Healthcheck : ECHEC (HTTP ${HEALTH_STATUS})"
        exit 1
    fi

    LIVE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${NGINX_PORT:-80}/api/healthcheck/live 2>/dev/null || echo "000")
    if [ "${LIVE_STATUS}" = "200" ]; then
        log_info "Liveness : OK (HTTP ${LIVE_STATUS})"
    else
        log_error "Liveness : ECHEC (HTTP ${LIVE_STATUS})"
        exit 1
    fi
else
    log_info "Smoke tests ignores (--skip-tests)"
fi

# Cache
${COMPOSE_CMD} exec php php bin/console cache:clear --env=prod --no-interaction 2>/dev/null || true
log_info "Cache applicatif vide."

echo ""
echo -e "${GREEN}Deploiement termine avec succes.${NC}"
echo "$(date '+%Y-%m-%d %H:%M:%S')"
