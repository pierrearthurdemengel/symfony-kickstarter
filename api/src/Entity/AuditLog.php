<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\AuditLogRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

/**
 * Journal d'audit des actions administratives.
 */
#[ORM\Entity(repositoryClass: AuditLogRepository::class)]
#[ORM\Table(name: 'audit_log')]
#[ORM\Index(columns: ['created_at'], name: 'IDX_AUDIT_CREATED')]
#[ORM\Index(columns: ['entity_type'], name: 'IDX_AUDIT_ENTITY_TYPE')]
class AuditLog
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['audit:read'])]
    private ?Uuid $id = null;

    /** @var string|null Action realisee (create, update, delete) */
    #[ORM\Column(type: 'string', length: 50)]
    #[Groups(['audit:read'])]
    private ?string $action = null;

    /** @var string|null Type d'entite concernee (User, MediaObject, etc.) */
    #[ORM\Column(type: 'string', length: 100)]
    #[Groups(['audit:read'])]
    private ?string $entityType = null;

    /** @var string|null Identifiant de l'entite concernee */
    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['audit:read'])]
    private ?string $entityId = null;

    /** @var array<string, mixed> Donnees modifiees */
    #[ORM\Column(type: 'json')]
    #[Groups(['audit:read'])]
    private array $changes = [];

    /** @var string|null Email de l'utilisateur ayant effectue l'action */
    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['audit:read'])]
    private ?string $performedBy = null;

    /** @var string|null Adresse IP de la requete */
    #[ORM\Column(type: 'string', length: 45, nullable: true)]
    #[Groups(['audit:read'])]
    private ?string $ipAddress = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['audit:read'])]
    private ?DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getAction(): ?string
    {
        return $this->action;
    }

    public function setAction(string $action): static
    {
        $this->action = $action;

        return $this;
    }

    public function getEntityType(): ?string
    {
        return $this->entityType;
    }

    public function setEntityType(string $entityType): static
    {
        $this->entityType = $entityType;

        return $this;
    }

    public function getEntityId(): ?string
    {
        return $this->entityId;
    }

    public function setEntityId(?string $entityId): static
    {
        $this->entityId = $entityId;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function getChanges(): array
    {
        return $this->changes;
    }

    /**
     * @param array<string, mixed> $changes
     */
    public function setChanges(array $changes): static
    {
        $this->changes = $changes;

        return $this;
    }

    public function getPerformedBy(): ?string
    {
        return $this->performedBy;
    }

    public function setPerformedBy(?string $performedBy): static
    {
        $this->performedBy = $performedBy;

        return $this;
    }

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(?string $ipAddress): static
    {
        $this->ipAddress = $ipAddress;

        return $this;
    }

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
