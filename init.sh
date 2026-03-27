#!/bin/bash
# Script d'initialisation pour personnaliser le template Symfony Kickstarter
# Usage: ./init.sh mon-projet

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
    echo "  - docker-compose.yaml (noms des containers, volumes, networks)"
    echo "  - docker-compose.override.yaml (configuration Xdebug)"
    echo "  - docker-compose.prod.yaml (stack production)"
    echo "  - api/.env, api/.env.example, api/.env.prod.example"
    echo "  - api/composer.json (namespace)"
    echo "  - front/package.json (name)"
    echo "  - Makefile (commentaires)"
    echo "  - README.md (titre, liens)"
    echo "  - Fixtures (domaine email)"
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
        sed -i "s/${OLD_NAME}/${NEW_NAME}/g" "$file"
        echo -e "  ${BLUE}[OK]${NC} $file"
        COUNT=$((COUNT + 1))
    fi
}

# Docker Compose (dev, override, prod)
replace_in_file "docker-compose.yaml"
replace_in_file "docker-compose.override.yaml"
replace_in_file "docker-compose.prod.yaml"

# Backend - environnement
replace_in_file "api/.env"
replace_in_file "api/.env.example"
replace_in_file "api/.env.prod.example"
replace_in_file "api/.env.dev"

# Backend - composer.json (namespace)
if [ -f "api/composer.json" ]; then
    sed -i "s/\"${OLD_NAME}\//\"${NEW_NAME}\//g" api/composer.json
    sed -i "s/Kickstarter/${NEW_NAME^}/g" api/composer.json
    echo -e "  ${BLUE}[OK]${NC} api/composer.json"
    COUNT=$((COUNT + 1))
fi

# Frontend - package.json
if [ -f "front/package.json" ]; then
    sed -i "s/symfony-${OLD_NAME}-front/symfony-${NEW_NAME}-front/g" front/package.json
    echo -e "  ${BLUE}[OK]${NC} front/package.json"
    COUNT=$((COUNT + 1))
fi

# Makefile
if [ -f "Makefile" ]; then
    sed -i "s/Symfony Kickstarter/Symfony ${NEW_NAME^}/g" Makefile
    echo -e "  ${BLUE}[OK]${NC} Makefile"
    COUNT=$((COUNT + 1))
fi

# README.md
if [ -f "README.md" ]; then
    sed -i "s/Symfony Kickstarter/Symfony ${NEW_NAME^}/g" README.md
    sed -i "s/symfony-kickstarter/symfony-${NEW_NAME}/g" README.md
    sed -i "s/${OLD_NAME}\.dev/${NEW_NAME}.dev/g" README.md
    echo -e "  ${BLUE}[OK]${NC} README.md"
    COUNT=$((COUNT + 1))
fi

# Fixtures (domaine email)
replace_in_file "api/src/DataFixtures/AppFixtures.php"

# CHANGELOG.md (nom du projet)
if [ -f "CHANGELOG.md" ]; then
    sed -i "s/Symfony Kickstarter/Symfony ${NEW_NAME^}/g" CHANGELOG.md
    echo -e "  ${BLUE}[OK]${NC} CHANGELOG.md"
    COUNT=$((COUNT + 1))
fi

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
