<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\NotificationRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

/**
 * Notification utilisateur (in-app).
 * Types supportes : info, success, warning, error.
 */
#[ORM\Entity(repositoryClass: NotificationRepository::class)]
#[ORM\Table(name: 'notification')]
#[ORM\Index(columns: ['user_id', 'is_read'], name: 'idx_notification_user_read')]
#[ORM\Index(columns: ['created_at'], name: 'idx_notification_created')]
class Notification
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['notification:read'])]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    /** Type de notification : info, success, warning, error */
    #[ORM\Column(type: 'string', length: 20)]
    #[Groups(['notification:read'])]
    private string $type = 'info';

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['notification:read'])]
    private string $title = '';

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['notification:read'])]
    private ?string $message = null;

    /** Lien optionnel (navigation frontend) */
    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['notification:read'])]
    private ?string $link = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['notification:read'])]
    private bool $isRead = false;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['notification:read'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message): static
    {
        $this->message = $message;

        return $this;
    }

    public function getLink(): ?string
    {
        return $this->link;
    }

    public function setLink(?string $link): static
    {
        $this->link = $link;

        return $this;
    }

    public function isRead(): bool
    {
        return $this->isRead;
    }

    public function setIsRead(bool $isRead): static
    {
        $this->isRead = $isRead;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
