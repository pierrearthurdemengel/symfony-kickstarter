#!/bin/bash
# Script d'initialisation pour personnaliser le template Symfony Kickstarter
# Usage: ./init.sh mon-projet

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
    echo "  - api/.env (DATABASE_URL, nom de la base)"
    echo "  - front/package.json (name)"
    echo "  - Makefile (commentaires)"
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

# docker-compose.yaml
if [ -f "docker-compose.yaml" ]; then
    sed -i "s/${OLD_NAME}/${NEW_NAME}/g" docker-compose.yaml
    echo "  [OK] docker-compose.yaml"
fi

# docker-compose.override.yaml
if [ -f "docker-compose.override.yaml" ]; then
    sed -i "s/${OLD_NAME}/${NEW_NAME}/g" docker-compose.override.yaml
    echo "  [OK] docker-compose.override.yaml"
fi

# api/.env
if [ -f "api/.env" ]; then
    sed -i "s/${OLD_NAME}/${NEW_NAME}/g" api/.env
    echo "  [OK] api/.env"
fi

# api/.env.example
if [ -f "api/.env.example" ]; then
    sed -i "s/${OLD_NAME}/${NEW_NAME}/g" api/.env.example
    echo "  [OK] api/.env.example"
fi

# api/composer.json
if [ -f "api/composer.json" ]; then
    sed -i "s/\"${OLD_NAME}\//\"${NEW_NAME}\//g" api/composer.json
    sed -i "s/Kickstarter/${NEW_NAME^}/g" api/composer.json
    echo "  [OK] api/composer.json"
fi

# front/package.json
if [ -f "front/package.json" ]; then
    sed -i "s/symfony-${OLD_NAME}-front/symfony-${NEW_NAME}-front/g" front/package.json
    echo "  [OK] front/package.json"
fi

# Makefile
if [ -f "Makefile" ]; then
    sed -i "s/Symfony Kickstarter/Symfony ${NEW_NAME^}/g" Makefile
    echo "  [OK] Makefile"
fi

# README.md
if [ -f "README.md" ]; then
    sed -i "s/Symfony Kickstarter/Symfony ${NEW_NAME^}/g" README.md
    sed -i "s/symfony-kickstarter/symfony-${NEW_NAME}/g" README.md
    sed -i "s/${OLD_NAME}\.dev/${NEW_NAME}.dev/g" README.md
    echo "  [OK] README.md"
fi

# Fixtures (emails)
if [ -f "api/src/DataFixtures/AppFixtures.php" ]; then
    sed -i "s/${OLD_NAME}\.dev/${NEW_NAME}.dev/g" api/src/DataFixtures/AppFixtures.php
    echo "  [OK] api/src/DataFixtures/AppFixtures.php"
fi

echo ""
echo -e "${GREEN}Projet '${NEW_NAME}' initialise avec succes.${NC}"
echo ""
echo "Prochaines etapes :"
echo "  1. make install"
echo "  2. make db-fixtures"
echo "  3. make jwt-generate"
echo "  4. Ouvrir http://localhost:3000"
