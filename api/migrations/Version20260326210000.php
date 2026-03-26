<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260326210000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout de la table audit_log pour le journal d\'audit administratif';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE audit_log (
            id UUID NOT NULL,
            action VARCHAR(50) NOT NULL,
            entity_type VARCHAR(100) NOT NULL,
            entity_id VARCHAR(255) DEFAULT NULL,
            changes JSON NOT NULL,
            performed_by VARCHAR(255) DEFAULT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('COMMENT ON COLUMN audit_log.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN audit_log.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE INDEX IDX_AUDIT_CREATED ON audit_log (created_at)');
        $this->addSql('CREATE INDEX IDX_AUDIT_ENTITY_TYPE ON audit_log (entity_type)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE audit_log');
    }
}
