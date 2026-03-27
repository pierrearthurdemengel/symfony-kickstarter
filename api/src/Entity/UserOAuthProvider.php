<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\UserOAuthProviderRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

/**
 * Association entre un utilisateur et un fournisseur OAuth (Google, GitHub).
 */
#[ORM\Entity(repositoryClass: UserOAuthProviderRepository::class)]
#[ORM\Table(name: 'user_oauth_provider')]
#[ORM\UniqueConstraint(name: 'uniq_oauth_provider_user', columns: ['provider', 'provider_user_id'])]
class UserOAuthProvider
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['oauth:read'])]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    /** Nom du fournisseur : google, github */
    #[ORM\Column(type: 'string', length: 30)]
    #[Groups(['oauth:read'])]
    private string $provider = '';

    /** Identifiant unique de l'utilisateur chez le fournisseur */
    #[ORM\Column(type: 'string', length: 255)]
    private string $providerUserId = '';

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $accessToken = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['oauth:read'])]
    private DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new DateTimeImmutable();
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

    public function getProvider(): string
    {
        return $this->provider;
    }

    public function setProvider(string $provider): static
    {
        $this->provider = $provider;

        return $this;
    }

    public function getProviderUserId(): string
    {
        return $this->providerUserId;
    }

    public function setProviderUserId(string $providerUserId): static
    {
        $this->providerUserId = $providerUserId;

        return $this;
    }

    public function getAccessToken(): ?string
    {
        return $this->accessToken;
    }

    public function setAccessToken(?string $accessToken): static
    {
        $this->accessToken = $accessToken;

        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
}
