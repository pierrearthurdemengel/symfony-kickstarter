<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260326200000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout des tables media_object, email_verification_token et des colonnes avatar_id, is_email_verified sur user';
    }

    public function up(Schema $schema): void
    {
        // Table media_object
        $this->addSql('CREATE TABLE media_object (
            id UUID NOT NULL,
            file_path VARCHAR(512) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            mime_type VARCHAR(100) NOT NULL,
            size INT NOT NULL,
            uploaded_by_id UUID DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('COMMENT ON COLUMN media_object.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN media_object.uploaded_by_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN media_object.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE INDEX IDX_14D43132B03A8386 ON media_object (uploaded_by_id)');
        $this->addSql('ALTER TABLE media_object ADD CONSTRAINT FK_14D43132B03A8386 FOREIGN KEY (uploaded_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');

        // Table email_verification_token
        $this->addSql('CREATE TABLE email_verification_token (
            id SERIAL NOT NULL,
            user_id UUID NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('COMMENT ON COLUMN email_verification_token.user_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN email_verification_token.expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN email_verification_token.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_EMAIL_VERIFY_TOKEN ON email_verification_token (token)');
        $this->addSql('CREATE INDEX IDX_EMAIL_VERIFY_USER ON email_verification_token (user_id)');
        $this->addSql('ALTER TABLE email_verification_token ADD CONSTRAINT FK_EMAIL_VERIFY_USER FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        // Colonne avatar_id sur user
        $this->addSql('ALTER TABLE "user" ADD avatar_id UUID DEFAULT NULL');
        $this->addSql('COMMENT ON COLUMN "user".avatar_id IS \'(DC2Type:uuid)\'');
        $this->addSql('CREATE INDEX IDX_USER_AVATAR ON "user" (avatar_id)');
        $this->addSql('ALTER TABLE "user" ADD CONSTRAINT FK_USER_AVATAR FOREIGN KEY (avatar_id) REFERENCES media_object (id) NOT DEFERRABLE INITIALLY IMMEDIATE');

        // Colonne is_email_verified sur user
        $this->addSql('ALTER TABLE "user" ADD is_email_verified BOOLEAN NOT NULL DEFAULT false');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" DROP CONSTRAINT FK_USER_AVATAR');
        $this->addSql('DROP INDEX IDX_USER_AVATAR');
        $this->addSql('ALTER TABLE "user" DROP avatar_id');
        $this->addSql('ALTER TABLE "user" DROP is_email_verified');

        $this->addSql('ALTER TABLE email_verification_token DROP CONSTRAINT FK_EMAIL_VERIFY_USER');
        $this->addSql('DROP TABLE email_verification_token');

        $this->addSql('ALTER TABLE media_object DROP CONSTRAINT FK_14D43132B03A8386');
        $this->addSql('DROP TABLE media_object');
    }
}
