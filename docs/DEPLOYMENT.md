# Guide de deploiement

Ce guide couvre le deploiement de Symfony Kickstarter en production sur differentes plateformes.

## Table des matieres

- [Prerequis](#prerequis)
- [Deploiement sur VPS avec Docker Compose](#deploiement-sur-vps-avec-docker-compose)
- [Deploiement avec Coolify](#deploiement-avec-coolify)
- [Deploiement avec Caprover](#deploiement-avec-caprover)
- [Configuration Kubernetes](#configuration-kubernetes)
- [Checklist de securite](#checklist-de-securite)

---

## Prerequis

- Un serveur avec Docker et Docker Compose installes
- Un nom de domaine configure (DNS A record vers le serveur)
- Les cles SSH pour l'acces au serveur

---

## Deploiement sur VPS avec Docker Compose

### DigitalOcean (Droplet)

#### 1. Creer un Droplet

- Image : Ubuntu 24.04 LTS
- Plan : Basic, 2 vCPU / 4 Go RAM minimum
- Region : la plus proche de vos utilisateurs
- Ajouter votre cle SSH

#### 2. Installer Docker

```bash
ssh root@votre-ip

# Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Docker Compose (inclus dans Docker Desktop / Docker Engine recent)
docker compose version
```

#### 3. Deployer l'application

```bash
# Cloner le projet
git clone https://github.com/votre-repo/votre-projet.git
cd votre-projet

# Configurer les variables d'environnement
cp api/.env.prod.example api/.env.local
nano api/.env.local
# Remplir : APP_SECRET, DATABASE_URL, JWT_PASSPHRASE, CORS_ALLOW_ORIGIN, MAILER_DSN

# Generer les cles JWT
docker compose -f docker-compose.prod.yaml run --rm php php bin/console lexik:jwt:generate-keypair

# Demarrer la stack
docker compose -f docker-compose.prod.yaml up -d

# Executer les migrations
docker compose -f docker-compose.prod.yaml exec php php bin/console doctrine:migrations:migrate --no-interaction

# Charger les fixtures (optionnel, pour un premier test)
docker compose -f docker-compose.prod.yaml exec php php bin/console doctrine:fixtures:load --no-interaction
```

#### 4. Configurer HTTPS avec Nginx reverse proxy

Installer Nginx et Certbot sur le host :

```bash
apt install nginx certbot python3-certbot-nginx

# Creer la config Nginx
cat > /etc/nginx/sites-available/votre-domaine <<'EOF'
server {
    server_name votre-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/votre-domaine /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Obtenir le certificat SSL
certbot --nginx -d votre-domaine.com
```

#### 5. Configurer les backups automatiques

```bash
# Rendre le script executable
chmod +x scripts/backup-postgres.sh

# Ajouter le cron (tous les jours a 3h)
crontab -e
# Ajouter :
# 0 3 * * * cd /chemin/vers/projet && ./scripts/backup-postgres.sh >> /var/log/kickstarter-backup.log 2>&1
```

#### 6. Configurer le monitoring

```bash
# Demarrer Prometheus + Grafana
docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml up -d prometheus grafana node-exporter postgres-exporter redis-exporter

# Grafana : http://votre-ip:3000 (admin/admin)
```

---

## Deploiement avec Coolify

[Coolify](https://coolify.io/) est une alternative open source a Heroku/Vercel pour l'auto-hebergement.

### 1. Installer Coolify

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 2. Configurer le projet

1. Connecter votre repository GitHub dans Coolify
2. Selectionner "Docker Compose" comme type de deploiement
3. Pointer vers `docker-compose.prod.yaml`
4. Ajouter les variables d'environnement dans l'interface Coolify :
   - `APP_SECRET`
   - `POSTGRES_PASSWORD`
   - `JWT_PASSPHRASE`
   - `CORS_ALLOW_ORIGIN`
   - `MAILER_DSN`

### 3. Deployer

Coolify gere automatiquement :
- Le build des images Docker
- Le certificat SSL (Let's Encrypt)
- Le reverse proxy (Traefik)
- Les deploiements automatiques sur push

---

## Deploiement avec Caprover

[Caprover](https://caprover.com/) est un PaaS auto-heberge.

### 1. Installer Caprover

```bash
docker run -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover
```

### 2. Configurer

1. Acceder a l'interface Caprover (port 3000)
2. Creer une application "kickstarter"
3. Activer HTTPS
4. Deployer via Git ou upload du `docker-compose.prod.yaml`
5. Configurer les variables d'environnement dans l'interface

---

## Configuration Kubernetes

Le template est Kubernetes-ready grace aux endpoints de sante separes.

### Healthcheck probes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kickstarter-api
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: php
          image: kickstarter-php:latest
          ports:
            - containerPort: 9000
          # Liveness probe : verifie que le processus PHP repond
          # Si echec, le pod est redemarre
          livenessProbe:
            httpGet:
              path: /api/healthcheck/live
              port: 80
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          # Readiness probe : verifie que l'app ET ses dependances sont pretes
          # Si echec, le pod est retire du load balancer
          readinessProbe:
            httpGet:
              path: /api/healthcheck
              port: 80
            initialDelaySeconds: 15
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "1000m"
              memory: "512Mi"
```

### Difference liveness vs readiness

| Probe | Endpoint | Verifie | En cas d'echec |
|---|---|---|---|
| **Liveness** | `/api/healthcheck/live` | Le processus PHP repond | Le pod est redemarre |
| **Readiness** | `/api/healthcheck` | PHP + PostgreSQL + Redis | Le pod est retire du load balancer |

La separation est importante : si PostgreSQL est temporairement indisponible, le pod ne doit pas etre redemarre (liveness ok) mais ne doit pas recevoir de trafic (readiness ko).

---

## Checklist de securite

Avant de mettre en production, verifier chaque point :

- [ ] `APP_ENV=prod` et `APP_DEBUG=0`
- [ ] `APP_SECRET` genere avec `openssl rand -hex 32` (unique par environnement)
- [ ] `JWT_PASSPHRASE` genere et stocke en secret
- [ ] `POSTGRES_PASSWORD` fort et unique
- [ ] `CORS_ALLOW_ORIGIN` restreint au domaine de production uniquement
- [ ] HTTPS configure avec certificat valide
- [ ] Ports PostgreSQL (5432) et Redis (6379) non exposes publiquement
- [ ] Cles JWT generees en production (`make jwt-generate`)
- [ ] `MERCURE_JWT_SECRET` genere et unique
- [ ] `MEILISEARCH_API_KEY` genere si Meilisearch est utilise
- [ ] Sentry configure pour le monitoring d'erreurs
- [ ] Backups automatises et testes (restauration verifiee)
- [ ] Rate limiting verifie et adapte a la charge prevue
- [ ] Firewall serveur configure (ufw/iptables)
- [ ] Fail2ban installe pour proteger SSH
- [ ] Mises a jour automatiques du systeme (unattended-upgrades)
