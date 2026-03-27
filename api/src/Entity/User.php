<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\UserRepository;
use App\State\UserHashPasswordProcessor;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\HasLifecycleCallbacks]
#[ORM\UniqueConstraint(name: 'UNIQ_USER_EMAIL', fields: ['email'])]
#[UniqueEntity(fields: ['email'], message: 'Un compte existe deja avec cet email.')]
#[ApiFilter(SearchFilter::class, properties: ['email' => 'partial', 'firstName' => 'partial', 'lastName' => 'partial'])]
#[ApiFilter(OrderFilter::class, properties: ['email', 'firstName', 'lastName', 'createdAt'])]
#[ApiFilter(DateFilter::class, properties: ['createdAt'])]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['user:read']],
        ),
        new Get(
            normalizationContext: ['groups' => ['user:read']],
        ),
        new Post(
            normalizationContext: ['groups' => ['user:read']],
            denormalizationContext: ['groups' => ['user:create']],
            processor: UserHashPasswordProcessor::class,
        ),
        new Put(
            normalizationContext: ['groups' => ['user:read']],
            denormalizationContext: ['groups' => ['user:write']],
            processor: UserHashPasswordProcessor::class,
        ),
        new Patch(
            normalizationContext: ['groups' => ['user:read']],
            denormalizationContext: ['groups' => ['user:write']],
            processor: UserHashPasswordProcessor::class,
        ),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']],
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['user:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(type: 'string', length: 180, unique: true)]
    #[Assert\NotBlank(message: 'L\'email est obligatoire.')]
    #[Assert\Email(message: 'L\'email "{{ value }}" n\'est pas valide.')]
    #[Groups(['user:read', 'user:write', 'user:create'])]
    private ?string $email = null;

    #[ORM\Column(type: 'string')]
    private ?string $password = null;

    /** @var string|null Mot de passe en clair, non persiste */
    #[Assert\NotBlank(message: 'Le mot de passe est obligatoire.', groups: ['user:create'])]
    #[Assert\Length(
        min: 8,
        minMessage: 'Le mot de passe doit contenir au moins {{ limit }} caracteres.',
        groups: ['user:create', 'Default'],
    )]
    #[Groups(['user:write', 'user:create'])]
    private ?string $plainPassword = null;

    /** @var list<string> */
    #[ORM\Column(type: 'json')]
    #[Groups(['user:read'])]
    private array $roles = [];

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'Le prenom ne doit pas depasser {{ limit }} caracteres.')]
    #[Groups(['user:read', 'user:write', 'user:create'])]
    private ?string $firstName = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'Le nom ne doit pas depasser {{ limit }} caracteres.')]
    #[Groups(['user:read', 'user:write', 'user:create'])]
    private ?string $lastName = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['user:read'])]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['user:read'])]
    private ?DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['user:read'])]
    private ?DateTimeImmutable $lastLoginAt = null;

    #[ORM\ManyToOne(targetEntity: MediaObject::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['user:read', 'user:write'])]
    private ?MediaObject $avatar = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['user:read'])]
    private bool $isEmailVerified = false;

    /** @var Collection<int, PermissionGroup> Groupes de permissions RBAC */
    #[ORM\ManyToMany(targetEntity: PermissionGroup::class)]
    #[ORM\JoinTable(name: 'user_permission_group')]
    #[Groups(['user:read'])]
    private Collection $permissionGroups;

    /** Secret TOTP pour l'authentification a deux facteurs */
    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $totpSecret = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['user:read'])]
    private bool $isTwoFactorEnabled = false;

    /** @var list<string>|null Codes de secours pour le 2FA */
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $backupCodes = null;

    public function __construct()
    {
        $this->permissionGroups = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /** @return list<string> */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // Chaque utilisateur a au minimum ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_values(array_unique($roles));
    }

    /** @param list<string> $roles */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): static
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(?string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(?string $lastName): static
    {
        $this->lastName = $lastName;

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

    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getLastLoginAt(): ?DateTimeImmutable
    {
        return $this->lastLoginAt;
    }

    public function setLastLoginAt(?DateTimeImmutable $lastLoginAt): static
    {
        $this->lastLoginAt = $lastLoginAt;

        return $this;
    }

    public function getAvatar(): ?MediaObject
    {
        return $this->avatar;
    }

    public function setAvatar(?MediaObject $avatar): static
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function isEmailVerified(): bool
    {
        return $this->isEmailVerified;
    }

    public function setIsEmailVerified(bool $isEmailVerified): static
    {
        $this->isEmailVerified = $isEmailVerified;

        return $this;
    }

    /** @return Collection<int, PermissionGroup> */
    public function getPermissionGroups(): Collection
    {
        return $this->permissionGroups;
    }

    public function addPermissionGroup(PermissionGroup $group): static
    {
        if (!$this->permissionGroups->contains($group)) {
            $this->permissionGroups->add($group);
        }

        return $this;
    }

    public function removePermissionGroup(PermissionGroup $group): static
    {
        $this->permissionGroups->removeElement($group);

        return $this;
    }

    /**
     * Retourne toutes les permissions de l'utilisateur (roles + groupes).
     *
     * @return list<string>
     */
    public function getAllPermissions(): array
    {
        $permissions = [];

        // Permissions implicites des roles
        if (\in_array('ROLE_ADMIN', $this->getRoles(), true)) {
            $permissions[] = 'admin.access';
        }

        // Permissions des groupes RBAC
        foreach ($this->permissionGroups as $group) {
            foreach ($group->getPermissions() as $permission) {
                $permissions[] = $permission->getName();
            }
        }

        return array_values(array_unique($permissions));
    }

    /**
     * Verifie si l'utilisateur a une permission specifique.
     */
    public function hasPermission(string $permissionName): bool
    {
        return \in_array($permissionName, $this->getAllPermissions(), true);
    }

    public function getTotpSecret(): ?string
    {
        return $this->totpSecret;
    }

    public function setTotpSecret(?string $totpSecret): static
    {
        $this->totpSecret = $totpSecret;

        return $this;
    }

    public function isTwoFactorEnabled(): bool
    {
        return $this->isTwoFactorEnabled;
    }

    public function setIsTwoFactorEnabled(bool $isTwoFactorEnabled): static
    {
        $this->isTwoFactorEnabled = $isTwoFactorEnabled;

        return $this;
    }

    /** @return list<string>|null */
    public function getBackupCodes(): ?array
    {
        return $this->backupCodes;
    }

    /** @param list<string>|null $backupCodes */
    public function setBackupCodes(?array $backupCodes): static
    {
        $this->backupCodes = $backupCodes;

        return $this;
    }

    /**
     * Consomme un code de secours (le retire de la liste).
     */
    public function consumeBackupCode(string $code): bool
    {
        if (null === $this->backupCodes) {
            return false;
        }

        $index = array_search($code, $this->backupCodes, true);
        if (false === $index) {
            return false;
        }

        unset($this->backupCodes[$index]);
        $this->backupCodes = array_values($this->backupCodes);

        return true;
    }

    public function eraseCredentials(): void
    {
        $this->plainPassword = null;
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new DateTimeImmutable();
    }
}
