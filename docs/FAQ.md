# FAQ - Questions frequentes

## Docker

### Les containers ne demarrent pas

**Symptome** : `docker compose up -d` echoue ou les containers redemarrent en boucle.

**Solutions** :
1. Verifier que Docker Desktop est lance et fonctionne :
   ```bash
   docker info
   ```
2. Verifier les ports disponibles (conflit avec un autre service) :
   ```bash
   docker compose ps
   # Si un port est deja utilise, le changer dans .env :
   NGINX_PORT=8081 docker compose up -d
   ```
3. Reconstruire les images si les Dockerfiles ont change :
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```
4. Verifier les logs du container qui echoue :
   ```bash
   docker compose logs php
   docker compose logs database
   ```

### Le container PHP ne demarre pas

**Causes frequentes** :
- Erreur de syntaxe dans un fichier PHP charge au boot
- Extension PHP manquante dans le Dockerfile
- Volume monte sur un fichier inexistant

**Diagnostic** :
```bash
docker compose logs php
# Ou entrer dans le container sans lancer PHP-FPM :
docker compose run --rm php sh
```

### Les volumes persistent entre les rebuilds

Les volumes Docker sont persistants. Pour repartir de zero :
```bash
docker compose down -v   # Supprime les volumes (ATTENTION: perte de donnees)
docker compose up -d
make install-back
make db-fixtures
```

### Container Mercure en erreur "port already allocated"

Un autre processus utilise le port 3001 :
```bash
# Trouver le processus
lsof -i :3001
# Ou changer le port Mercure
MERCURE_PORT=3002 docker compose up -d mercure
```

---

## Permissions fichiers

### "Permission denied" sur var/cache ou var/log

**Cause** : le container PHP tourne avec un utilisateur different de votre utilisateur local.

**Solution Linux/Mac** :
```bash
# Donner les droits au user www-data du container
sudo chown -R $(id -u):$(id -g) api/var
chmod -R 775 api/var
```

**Solution alternative** : ajouter dans `docker-compose.override.yaml` :
```yaml
services:
  php:
    user: "${UID:-1000}:${GID:-1000}"
```

### "Permission denied" sur les uploads

```bash
mkdir -p api/var/uploads
chmod 775 api/var/uploads
```

---

## JWT

### "Unable to create signed JWT" ou "JWT key not found"

Les cles JWT ne sont pas generees :
```bash
make jwt-generate
```

Verifier que les fichiers existent :
```bash
ls -la api/config/jwt/
# Doit contenir : private.pem et public.pem
```

### Token JWT expire instantanement

Verifier la configuration de duree de vie dans `api/config/packages/lexik_jwt_authentication.yaml` :
```yaml
lexik_jwt_authentication:
    token_ttl: 3600  # 1 heure en secondes
```

### "Invalid JWT Token" apres un redemarrage

Si les cles JWT ont ete regenerees, tous les tokens en circulation deviennent invalides. C'est normal. Les utilisateurs doivent se reconnecter.

### Utiliser les cookies httpOnly au lieu du localStorage

Activer dans `api/.env.local` :
```
JWT_COOKIE_ENABLED=true
```

Le token sera automatiquement envoye en cookie httpOnly securise au lieu d'etre retourne dans le body JSON.

---

## CORS

### "CORS policy: No 'Access-Control-Allow-Origin' header"

**En developpement** : verifier que `CORS_ALLOW_ORIGIN` dans `api/.env` inclut l'URL du frontend :
```
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
```

**En production** : restreindre a votre domaine :
```
CORS_ALLOW_ORIGIN='^https://mondomaine\.com$'
```

### Les requetes preflight OPTIONS echouent

Verifier que le bundle NelmioCorsBundle est bien configure dans `api/config/packages/nelmio_cors.yaml` et que le `access_control` dans `security.yaml` ne bloque pas les requetes OPTIONS.

---

## Base de donnees

### "Connection refused" vers PostgreSQL

1. Verifier que le container PostgreSQL tourne :
   ```bash
   docker compose ps database
   ```
2. Verifier le `DATABASE_URL` dans `api/.env` :
   ```
   DATABASE_URL="postgresql://kickstarter:kickstarter@database:5432/kickstarter?serverVersion=16&charset=utf8"
   ```
   - Le hostname est `database` (nom du service Docker), pas `localhost`
   - Le port est `5432` (port interne Docker), pas `5433` (port expose)

### Les migrations echouent

```bash
# Voir le statut des migrations
make shell-php
php bin/console doctrine:migrations:status

# Si une migration est bloquee, la forcer manuellement :
php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version20260327100000' --up --no-interaction
```

### Reinitialiser la base completement

```bash
make db-reset
```

---

## Frontend

### "Module not found" apres un git pull

Les dependances npm ne sont pas a jour :
```bash
make install-front
```

### Le hot reload ne fonctionne pas

1. Verifier que le container Node tourne :
   ```bash
   docker compose ps node
   ```
2. Verifier les logs Vite :
   ```bash
   make logs-front
   ```
3. Sur WSL2/Windows, le file watching peut echouer. Ajouter dans `vite.config.ts` :
   ```typescript
   server: {
     watch: {
       usePolling: true,
     },
   },
   ```

### Erreur TypeScript mais le code semble correct

```bash
# Verifier la version de TypeScript et les types
make shell-node
npx tsc --noEmit
```

---

## Tests

### Les tests backend echouent avec "table not found"

La base de test n'est pas configuree :
```bash
make shell-php
php bin/console doctrine:database:create --env=test --if-not-exists
php bin/console doctrine:migrations:migrate --env=test --no-interaction
```

### Les tests sont lents

Le template utilise `dama/doctrine-test-bundle` pour l'isolation des tests. Si les tests sont lents, verifier que le bundle est bien active dans `api/config/packages/test/dama_doctrine_test_bundle.yaml`.

### Couverture de code a 0%

Xdebug doit etre active :
```bash
# Verifier dans le container PHP
make shell-php
php -m | grep xdebug
```

Si Xdebug n'est pas charge, l'activer dans `docker-compose.override.yaml` :
```yaml
services:
  php:
    environment:
      XDEBUG_MODE: coverage
```

---

## Production

### Erreur "APP_SECRET must be set"

En production, vous devez generer un secret unique :
```bash
openssl rand -hex 32
```

Ajouter dans `api/.env.local` :
```
APP_SECRET=votre_secret_genere
```

### Les assets statiques retournent 404

En production, le frontend doit etre build et les fichiers copies dans le volume Nginx :
```bash
make front-build
make prod-build
```

### Le worker Messenger ne traite pas les messages

Verifier que Supervisor est configure et demarre dans le container PHP de production :
```bash
docker compose -f docker-compose.prod.yaml exec php supervisorctl status
```
