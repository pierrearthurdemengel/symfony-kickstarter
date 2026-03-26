# Symfony Kickstarter - Makefile
# Commandes courantes pour le projet

.DEFAULT_GOAL := help

DOCKER_COMPOSE = docker compose
PHP_EXEC = $(DOCKER_COMPOSE) exec php
NODE_EXEC = $(DOCKER_COMPOSE) exec node
CONSOLE = $(PHP_EXEC) php bin/console
COMPOSER = $(PHP_EXEC) composer

# ------------------------------------------------------------------
# Aide
# ------------------------------------------------------------------

.PHONY: help
help: ## Afficher cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ------------------------------------------------------------------
# Installation
# ------------------------------------------------------------------

.PHONY: install
install: ## Installer le projet complet
	$(DOCKER_COMPOSE) build
	$(DOCKER_COMPOSE) up -d
	$(MAKE) install-back
	$(MAKE) install-front

.PHONY: install-back
install-back: ## Installer les dependances back (Composer)
	$(COMPOSER) install
	$(CONSOLE) doctrine:database:create --if-not-exists
	$(CONSOLE) doctrine:migrations:migrate --no-interaction

.PHONY: install-front
install-front: ## Installer les dependances front (npm)
	$(NODE_EXEC) npm install

# ------------------------------------------------------------------
# Developpement
# ------------------------------------------------------------------

.PHONY: start
start: ## Demarrer les containers
	$(DOCKER_COMPOSE) up -d

.PHONY: stop
stop: ## Arreter les containers
	$(DOCKER_COMPOSE) down

.PHONY: restart
restart: ## Redemarrer les containers
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) up -d

.PHONY: logs
logs: ## Afficher les logs de tous les services
	$(DOCKER_COMPOSE) logs -f

.PHONY: logs-php
logs-php: ## Afficher les logs PHP
	$(DOCKER_COMPOSE) logs -f php

.PHONY: logs-front
logs-front: ## Afficher les logs du front
	$(DOCKER_COMPOSE) logs -f node

# ------------------------------------------------------------------
# Base de donnees
# ------------------------------------------------------------------

.PHONY: db-create
db-create: ## Creer la base de donnees
	$(CONSOLE) doctrine:database:create --if-not-exists

.PHONY: db-migrate
db-migrate: ## Executer les migrations
	$(CONSOLE) doctrine:migrations:migrate --no-interaction

.PHONY: db-fixtures
db-fixtures: ## Charger les fixtures
	$(CONSOLE) doctrine:fixtures:load --no-interaction

.PHONY: db-reset
db-reset: ## Reinitialiser la base (drop + create + migrate + fixtures)
	$(CONSOLE) doctrine:database:drop --force --if-exists
	$(CONSOLE) doctrine:database:create
	$(CONSOLE) doctrine:migrations:migrate --no-interaction
	$(CONSOLE) doctrine:fixtures:load --no-interaction

# ------------------------------------------------------------------
# Qualite du code
# ------------------------------------------------------------------

.PHONY: test
test: test-back test-front ## Lancer tous les tests

.PHONY: test-back
test-back: ## Lancer les tests back (PHPUnit)
	$(PHP_EXEC) php vendor/bin/phpunit

.PHONY: test-front
test-front: ## Lancer les tests front
	$(NODE_EXEC) npm test

.PHONY: lint
lint: lint-back lint-front ## Lancer tous les linters

.PHONY: lint-back
lint-back: ## Lancer les linters back (PHPStan + CS Fixer)
	$(PHP_EXEC) php vendor/bin/phpstan analyse
	$(PHP_EXEC) php vendor/bin/php-cs-fixer fix --dry-run --diff

.PHONY: lint-front
lint-front: ## Lancer les linters front
	$(NODE_EXEC) npm run lint

# ------------------------------------------------------------------
# Utilitaires
# ------------------------------------------------------------------

.PHONY: shell-php
shell-php: ## Ouvrir un shell dans le container PHP
	$(PHP_EXEC) sh

.PHONY: shell-node
shell-node: ## Ouvrir un shell dans le container Node
	$(NODE_EXEC) sh

.PHONY: jwt-generate
jwt-generate: ## Generer les cles JWT
	$(CONSOLE) lexik:jwt:generate-keypair --overwrite
