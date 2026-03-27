# Migrations zero-downtime

Ce guide explique comment ecrire des migrations Doctrine qui ne bloquent pas l'application en production.

## Principe

Une migration zero-downtime ne doit jamais :
- Verrouiller une table entiere pendant plus de quelques millisecondes
- Supprimer une colonne encore utilisee par le code en production
- Renommer une colonne ou une table directement

## Regles

### 1. Ajouter une colonne : toujours avec DEFAULT NULL

```php
// Bon : nullable, pas de verrouillage
$this->addSql('ALTER TABLE "user" ADD COLUMN phone VARCHAR(20) DEFAULT NULL');

// Mauvais : NOT NULL sans default verrouille la table pour remplir les lignes existantes
$this->addSql('ALTER TABLE "user" ADD COLUMN phone VARCHAR(20) NOT NULL');
```

Si la colonne doit etre NOT NULL a terme, proceder en 3 etapes :
1. Migration 1 : ajouter la colonne nullable
2. Script de backfill : remplir les valeurs existantes par batch
3. Migration 2 : ajouter la contrainte NOT NULL

### 2. Supprimer une colonne : en 2 deploiements

**Deploiement 1** : retirer les references a la colonne dans le code (la colonne existe encore en base).

**Deploiement 2** : supprimer la colonne en base (le code ne la reference plus).

```php
// Migration du deploiement 2 seulement
$this->addSql('ALTER TABLE "user" DROP COLUMN old_column');
```

### 3. Renommer une colonne : en 3 deploiements

1. **Deploiement 1** : ajouter la nouvelle colonne, ecrire dans les deux
2. **Deploiement 2** : backfill les anciennes donnees, lire depuis la nouvelle colonne
3. **Deploiement 3** : supprimer l'ancienne colonne

### 4. Ajouter un index : CONCURRENTLY

PostgreSQL supporte la creation d'index sans verrouillage :

```php
// Bon : CONCURRENTLY ne verrouille pas les ecritures
$this->addSql('CREATE INDEX CONCURRENTLY idx_user_email ON "user" (email)');

// Mauvais : verrouille la table en ecriture pendant la creation de l'index
$this->addSql('CREATE INDEX idx_user_email ON "user" (email)');
```

**Important** : les migrations avec `CONCURRENTLY` ne peuvent pas etre executees dans une transaction. Ajouter dans la migration :

```php
public function isTransactional(): bool
{
    return false;
}
```

### 5. Modifier un type de colonne

Eviter les `ALTER TABLE ... ALTER COLUMN ... TYPE ...` sur les grosses tables. Preferer :
1. Ajouter une nouvelle colonne avec le nouveau type
2. Backfill
3. Swap les colonnes

### 6. Supprimer une table

Meme principe que les colonnes : retirer les references dans le code d'abord, supprimer la table ensuite.

## Script de backfill par batch

Pour remplir une colonne sur une grande table sans bloquer les transactions :

```php
// Dans une commande Symfony, pas dans une migration
$batchSize = 1000;
$offset = 0;

do {
    $updated = $connection->executeStatement(
        'UPDATE "user" SET phone = :default WHERE phone IS NULL LIMIT :batch',
        ['default' => '', 'batch' => $batchSize]
    );
    $offset += $batchSize;

    // Pause pour laisser respirer la base
    usleep(100_000); // 100ms
} while ($updated > 0);
```

## Verification avant deploiement

Avant d'executer une migration en production :

1. Lire le SQL genere :
   ```bash
   php bin/console doctrine:migrations:migrate --dry-run
   ```

2. Verifier qu'il n'y a pas de `LOCK TABLE`, `ALTER TABLE ... NOT NULL` sans default, ou `DROP COLUMN` sur une colonne encore utilisee.

3. Estimer le temps d'execution sur un dump de la base de production.

4. Planifier un rollback : garder le `down()` de la migration a jour.

## Rollback

Chaque migration doit implementer `down()` pour permettre un rollback :

```php
public function down(Schema $schema): void
{
    $this->addSql('ALTER TABLE "user" DROP COLUMN phone');
}
```

Rollback d'une migration :
```bash
php bin/console doctrine:migrations:execute 'DoctrineMigrations\VersionXXX' --down --no-interaction
```
