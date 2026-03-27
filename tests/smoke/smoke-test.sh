#!/bin/bash
# Smoke tests post-deploiement
# Verifie que les endpoints critiques repondent correctement apres un deploiement.
# Usage : ./tests/smoke/smoke-test.sh [BASE_URL]

set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"
API_URL="${BASE_URL}/api"
ERRORS=0

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

check_endpoint() {
  local url="$1"
  local expected_status="$2"
  local description="$3"

  status=$(curl -s -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")

  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}[OK]${NC} $description ($url) - HTTP $status"
  else
    echo -e "${RED}[FAIL]${NC} $description ($url) - HTTP $status (attendu: $expected_status)"
    ERRORS=$((ERRORS + 1))
  fi
}

check_json_field() {
  local url="$1"
  local field="$2"
  local expected="$3"
  local description="$4"

  response=$(curl -s "$url" 2>/dev/null || echo "{}")
  value=$(echo "$response" | grep -o "\"$field\":\"[^\"]*\"" | head -1 | cut -d'"' -f4)

  if [ "$value" = "$expected" ]; then
    echo -e "${GREEN}[OK]${NC} $description - $field=$value"
  else
    echo -e "${RED}[FAIL]${NC} $description - $field=$value (attendu: $expected)"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "================================================"
echo " Smoke Tests - Symfony Kickstarter"
echo " URL: $BASE_URL"
echo "================================================"
echo ""

# Healthcheck
check_endpoint "$API_URL/healthcheck" "200" "Healthcheck API"
check_json_field "$API_URL/healthcheck" "status" "ok" "Healthcheck status"

# Documentation API
check_endpoint "$API_URL/docs" "200" "Documentation OpenAPI"

# Endpoint public - login (methode GET doit retourner 405)
check_endpoint "$API_URL/login" "405" "Login GET (methode non autorisee)"

# Endpoint public - register (methode GET doit retourner 405)
check_endpoint "$API_URL/register" "405" "Register GET (methode non autorisee)"

# Endpoint protege sans JWT
check_endpoint "$API_URL/users" "401" "Users sans authentification"

# Endpoint admin sans JWT
check_endpoint "$API_URL/admin/stats" "401" "Admin sans authentification"

# Feature flags (public GET)
check_endpoint "$API_URL/feature-flags" "200" "Feature flags (public)"

echo ""
echo "================================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN} Tous les smoke tests passent !${NC}"
else
  echo -e "${RED} $ERRORS smoke test(s) en echec${NC}"
  exit 1
fi
echo "================================================"
