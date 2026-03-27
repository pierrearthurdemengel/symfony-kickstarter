<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\RefreshTokenRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

/**
 * Token de rafraichissement pour renouveler les access tokens JWT.
 * Chaque token est a usage unique (rotation) : un nouveau token est genere a chaque utilisation.
 */
#[ORM\Entity(repositoryClass: RefreshTokenRepository::class)]
#[ORM\Table(name: 'refresh_token')]
#[ORM\Index(columns: ['expires_at'], name: 'idx_refresh_token_expires')]
#[ORM\HasLifecycleCallbacks]
class RefreshToken
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    /** Token opaque (64 caracteres hex) */
    #[ORM\Column(type: 'string', length: 128, unique: true)]
    private ?string $token = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?DateTimeImmutable $expiresAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?DateTimeImmutable $createdAt = null;

    /** Adresse IP du client ayant genere le token */
    #[ORM\Column(type: 'string', length: 45, nullable: true)]
    private ?string $ipAddress = null;

    /** User-Agent du client */
    #[ORM\Column(type: 'string', length: 512, nullable: true)]
    private ?string $userAgent = null;

    /** Indique si le token a ete revoque manuellement */
    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $isRevoked = false;

    public function getId(): ?int
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

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): static
    {
        $this->token = $token;

        return $this;
    }

    public function getExpiresAt(): ?DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
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

    public function getUserAgent(): ?string
    {
        return $this->userAgent;
    }

    public function setUserAgent(?string $userAgent): static
    {
        $this->userAgent = $userAgent;

        return $this;
    }

    public function isRevoked(): bool
    {
        return $this->isRevoked;
    }

    public function setIsRevoked(bool $isRevoked): static
    {
        $this->isRevoked = $isRevoked;

        return $this;
    }

    public function isExpired(): bool
    {
        return null !== $this->expiresAt && $this->expiresAt < new DateTimeImmutable();
    }

    /** Verifie si le token est utilisable (non expire et non revoque) */
    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isRevoked;
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new DateTimeImmutable();
    }
}
