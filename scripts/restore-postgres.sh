#!/bin/bash
# Restauration d'un backup PostgreSQL
# Usage : ./scripts/restore-postgres.sh <fichier_backup.sql.gz>
#
# Le script demande confirmation avant d'ecraser la base existante.

set -euo pipefail

POSTGRES_USER="${POSTGRES_USER:-kickstarter}"
POSTGRES_DB="${POSTGRES_DB:-kickstarter}"
CONTAINER_NAME="${CONTAINER_NAME:-kickstarter-database-prod}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "${1:-}" ]; then
    echo -e "${YELLOW}Usage: ./scripts/restore-postgres.sh <fichier_backup.sql.gz>${NC}"
    echo ""
    echo "Backups disponibles :"
    ls -lh backups/*.sql.gz 2>/dev/null || echo "  Aucun backup trouve dans ./backups/"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}Erreur : fichier '${BACKUP_FILE}' introuvable.${NC}"
    exit 1
fi

# Verification de l'integrite
if ! gzip -t "${BACKUP_FILE}" 2>/dev/null; then
    echo -e "${RED}Erreur : le fichier de backup est corrompu.${NC}"
    exit 1
fi

echo -e "${YELLOW}ATTENTION : cette operation va remplacer la base '${POSTGRES_DB}' par le backup :${NC}"
echo "  ${BACKUP_FILE}"
echo ""
read -p "Confirmer la restauration ? (oui/non) : " CONFIRM

if [ "${CONFIRM}" != "oui" ]; then
    echo "Restauration annulee."
    exit 0
fi

# Verification que le container tourne
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}Erreur : le container ${CONTAINER_NAME} n'est pas en cours d'execution.${NC}"
    exit 1
fi

echo -e "${GREEN}Restauration en cours...${NC}"

# Drop et recreation de la base
docker exec "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${POSTGRES_DB}' AND pid <> pg_backend_pid();" postgres 2>/dev/null || true
docker exec "${CONTAINER_NAME}" dropdb -U "${POSTGRES_USER}" --if-exists "${POSTGRES_DB}"
docker exec "${CONTAINER_NAME}" createdb -U "${POSTGRES_USER}" "${POSTGRES_DB}"

# Import du backup
gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --quiet

echo -e "${GREEN}Restauration terminee avec succes.${NC}"
echo ""
echo "Prochaine etape : relancer les migrations si necessaire"
echo "  docker compose -f docker-compose.prod.yaml exec php php bin/console doctrine:migrations:migrate --no-interaction"
