#!/bin/bash
# Script d'initialisation pour personnaliser le template Symfony Kickstarter
# Usage: ./init.sh mon-projet
#
# Ce script :
# 1. Remplace toutes les references a "kickstarter" par le nom de votre projet
# 2. Met a jour les namespaces, noms de containers, volumes, reseaux
# 3. Genere un APP_SECRET aleatoire
# 4. Reinitialise le depot Git
# 5. Se supprime apres execution

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

OLD_NAME="kickstarter"

# Verification de l'argument
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./init.sh <nom-du-projet>${NC}"
    echo ""
    echo "Exemple: ./init.sh mon-projet"
    echo ""
    echo "Le script remplace '${OLD_NAME}' par le nom de votre projet dans :"
    echo "  - docker-compose.yaml, override, prod, monitoring"
    echo "  - api/.env, api/.env.example, api/.env.prod.example"
    echo "  - api/composer.json (namespace)"
    echo "  - front/package.json (name)"
    echo "  - Makefile, README.md, CHANGELOG.md, CONTRIBUTING.md"
    echo "  - Fixtures (domaine email)"
    echo "  - Scripts de deploiement et backup"
    echo "  - Workflows GitHub Actions"
    echo "  - Configuration monitoring (Prometheus, Grafana)"
    echo ""
    echo "Il genere aussi un APP_SECRET aleatoire et reinitialise le depot Git."
    exit 1
fi

NEW_NAME="$1"

# Validation du nom (alphanumerique + tirets uniquement)
if ! echo "$NEW_NAME" | grep -qE '^[a-z0-9][a-z0-9-]*[a-z0-9]$'; then
    echo -e "${RED}Erreur: le nom du projet ne doit contenir que des lettres minuscules, des chiffres et des tirets.${NC}"
    echo "Il doit commencer et finir par une lettre ou un chiffre."
    echo "Exemple: mon-projet, app2, my-api"
    exit 1
fi

if [ "$NEW_NAME" = "$OLD_NAME" ]; then
    echo -e "${YELLOW}Le nom est deja '${OLD_NAME}', rien a faire.${NC}"
    exit 0
fi

echo -e "${GREEN}Initialisation du projet '${NEW_NAME}'...${NC}"
echo ""

# Compteur de fichiers modifies
COUNT=0

# Fonction de remplacement securisee
replace_in_file() {
    local file="$1"
    if [ -f "$file" ]; then
        if grep -q "${OLD_NAME}" "$file" 2>/dev/null; then
            sed -i "s/${OLD_NAME}/${NEW_NAME}/g" "$file"
            echo -e "  ${BLUE}[OK]${NC} $file"
            COUNT=$((COUNT + 1))
        fi
    fi
}

# Fonction de remplacement avec pattern capitalise
replace_capitalized() {
    local file="$1"
    local old_cap="Kickstarter"
    local new_cap="${NEW_NAME^}"
    if [ -f "$file" ]; then
        if grep -q "${old_cap}" "$file" 2>/dev/null; then
            sed -i "s/${old_cap}/${new_cap}/g" "$file"
        fi
    fi
}

echo -e "${YELLOW}[1/7] Docker Compose${NC}"
replace_in_file "docker-compose.yaml"
replace_in_file "docker-compose.override.yaml"
replace_in_file "docker-compose.prod.yaml"
replace_in_file "docker-compose.monitoring.yaml"

echo -e "${YELLOW}[2/7] Backend${NC}"
replace_in_file "api/.env"
replace_in_file "api/.env.example"
replace_in_file "api/.env.prod.example"
replace_in_file "api/.env.dev"

# composer.json (namespace)
if [ -f "api/composer.json" ]; then
    sed -i "s/\"${OLD_NAME}\//\"${NEW_NAME}\//g" api/composer.json
    replace_capitalized "api/composer.json"
    echo -e "  ${BLUE}[OK]${NC} api/composer.json"
    COUNT=$((COUNT + 1))
fi

# Fixtures (domaine email)
replace_in_file "api/src/DataFixtures/AppFixtures.php"

echo -e "${YELLOW}[3/7] Frontend${NC}"
if [ -f "front/package.json" ]; then
    sed -i "s/symfony-${OLD_NAME}-front/symfony-${NEW_NAME}-front/g" front/package.json
    echo -e "  ${BLUE}[OK]${NC} front/package.json"
    COUNT=$((COUNT + 1))
fi

echo -e "${YELLOW}[4/7] Documentation${NC}"
if [ -f "Makefile" ]; then
    replace_capitalized "Makefile"
    replace_in_file "Makefile"
fi

if [ -f "README.md" ]; then
    replace_capitalized "README.md"
    sed -i "s/symfony-kickstarter/symfony-${NEW_NAME}/g" README.md
    sed -i "s/${OLD_NAME}\.dev/${NEW_NAME}.dev/g" README.md
    echo -e "  ${BLUE}[OK]${NC} README.md"
    COUNT=$((COUNT + 1))
fi

if [ -f "CHANGELOG.md" ]; then
    replace_capitalized "CHANGELOG.md"
    echo -e "  ${BLUE}[OK]${NC} CHANGELOG.md"
    COUNT=$((COUNT + 1))
fi

if [ -f "CONTRIBUTING.md" ]; then
    replace_capitalized "CONTRIBUTING.md"
    sed -i "s/symfony-kickstarter/symfony-${NEW_NAME}/g" CONTRIBUTING.md
    echo -e "  ${BLUE}[OK]${NC} CONTRIBUTING.md"
    COUNT=$((COUNT + 1))
fi

echo -e "${YELLOW}[5/7] Scripts${NC}"
replace_in_file "scripts/backup-postgres.sh"
replace_in_file "scripts/restore-postgres.sh"
replace_in_file "scripts/deploy.sh"

echo -e "${YELLOW}[6/7] Workflows CI/CD${NC}"
replace_in_file ".github/workflows/ci.yaml"
replace_in_file ".github/workflows/deploy.yaml"
replace_in_file ".github/workflows/staging.yaml"

echo -e "${YELLOW}[7/7] Monitoring${NC}"
replace_in_file "docker/monitoring/prometheus.yml"
if [ -d "docker/monitoring/grafana" ]; then
    find docker/monitoring/grafana -type f -name "*.json" -exec sed -i "s/${OLD_NAME}/${NEW_NAME}/g" {} \;
    echo -e "  ${BLUE}[OK]${NC} docker/monitoring/grafana/"
    COUNT=$((COUNT + 1))
fi

# Generation d'un APP_SECRET aleatoire
echo ""
echo -e "${YELLOW}Generation d'un APP_SECRET...${NC}"
APP_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n' | head -c 64)
for env_file in api/.env api/.env.example api/.env.prod.example; do
    if [ -f "$env_file" ]; then
        if grep -q "APP_SECRET=" "$env_file"; then
            sed -i "s/APP_SECRET=.*/APP_SECRET=${APP_SECRET}/" "$env_file"
        fi
    fi
done
echo -e "  ${BLUE}[OK]${NC} APP_SECRET genere"

# Suppression des fichiers de template inutiles
echo ""
echo -e "${YELLOW}Nettoyage des fichiers de template...${NC}"
rm -f docs/adr/ADR-*.md 2>/dev/null && echo -e "  ${BLUE}[OK]${NC} ADRs supprimes (specifiques au template)" || true

# Suppression de l'historique Git du template
if [ -d ".git" ]; then
    echo ""
    echo -e "${YELLOW}Reinitialisation du depot Git...${NC}"
    rm -rf .git
    git init
    echo -e "  ${BLUE}[OK]${NC} Nouveau depot Git initialise"
fi

# Suppression du script d'init (plus necessaire apres utilisation)
echo ""
echo -e "${YELLOW}Nettoyage...${NC}"
rm -f init.sh
echo -e "  ${BLUE}[OK]${NC} init.sh supprime"

echo ""
echo -e "${GREEN}Projet '${NEW_NAME}' initialise avec succes (${COUNT} fichiers modifies).${NC}"
echo ""
echo "Prochaines etapes :"
echo "  1. make install"
echo "  2. make db-fixtures"
echo "  3. make jwt-generate"
echo "  4. Ouvrir http://localhost:8080"
echo ""
echo -e "${BLUE}git add -A && git commit -m 'feat: init project ${NEW_NAME}'${NC}"
