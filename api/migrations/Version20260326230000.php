<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration V0.5 : table notification (notifications utilisateur in-app).
 */
final class Version20260326230000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Creation de la table notification pour les notifications in-app';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE notification (
            id UUID NOT NULL,
            user_id UUID NOT NULL,
            type VARCHAR(20) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT DEFAULT NULL,
            link VARCHAR(255) DEFAULT NULL,
            is_read BOOLEAN DEFAULT false NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX idx_notification_user_read ON notification (user_id, is_read)');
        $this->addSql('CREATE INDEX idx_notification_created ON notification (created_at)');
        $this->addSql('COMMENT ON COLUMN notification.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN notification.user_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN notification.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CAA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE notification');
    }
}
