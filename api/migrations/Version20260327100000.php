<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * V0.9 : Table des refresh tokens pour la rotation JWT.
 */
final class Version20260327100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'V0.9 - Table refresh_token pour le rafraichissement JWT avec rotation';
    }

    public function up(Schema $schema): void
    {
        // Table des refresh tokens
        $this->addSql('CREATE TABLE refresh_token (
            id SERIAL NOT NULL,
            user_id UUID NOT NULL,
            token VARCHAR(128) NOT NULL,
            expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            user_agent VARCHAR(512) DEFAULT NULL,
            is_revoked BOOLEAN DEFAULT false NOT NULL,
            PRIMARY KEY (id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_C74F21955F37A13B ON refresh_token (token)');
        $this->addSql('CREATE INDEX idx_refresh_token_expires ON refresh_token (expires_at)');
        $this->addSql('CREATE INDEX IDX_C74F2195A76ED395 ON refresh_token (user_id)');
        $this->addSql('ALTER TABLE refresh_token ADD CONSTRAINT FK_C74F2195A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE refresh_token DROP CONSTRAINT FK_C74F2195A76ED395');
        $this->addSql('DROP TABLE refresh_token');
    }
}
