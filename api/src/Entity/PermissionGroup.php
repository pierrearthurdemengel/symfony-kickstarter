<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\PermissionGroupRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

/**
 * Groupe de permissions assignable aux utilisateurs.
 * Exemples : Manager, Support, Editeur.
 */
#[ORM\Entity(repositoryClass: PermissionGroupRepository::class)]
#[ORM\Table(name: 'permission_group')]
#[UniqueEntity(fields: ['name'])]
class PermissionGroup
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['permission_group:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(type: 'string', length: 100, unique: true)]
    #[Groups(['permission_group:read'])]
    private string $name = '';

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['permission_group:read'])]
    private string $description = '';

    /** @var Collection<int, Permission> */
    #[ORM\ManyToMany(targetEntity: Permission::class)]
    #[ORM\JoinTable(name: 'permission_group_permission')]
    #[Groups(['permission_group:read'])]
    private Collection $permissions;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['permission_group:read'])]
    private DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->permissions = new ArrayCollection();
        $this->createdAt = new DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    /** @return Collection<int, Permission> */
    public function getPermissions(): Collection
    {
        return $this->permissions;
    }

    public function addPermission(Permission $permission): static
    {
        if (!$this->permissions->contains($permission)) {
            $this->permissions->add($permission);
        }

        return $this;
    }

    public function removePermission(Permission $permission): static
    {
        $this->permissions->removeElement($permission);

        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
}
