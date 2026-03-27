<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\PermissionRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

/**
 * Permission granulaire du systeme RBAC.
 * Exemples : users.read, users.create, audit.read, export.users.
 */
#[ORM\Entity(repositoryClass: PermissionRepository::class)]
#[ORM\Table(name: 'permission')]
#[UniqueEntity(fields: ['name'])]
class Permission
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['permission:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(type: 'string', length: 100, unique: true)]
    #[Groups(['permission:read'])]
    private string $name = '';

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['permission:read'])]
    private string $description = '';

    /** Categorie pour le regroupement dans l'interface (ex: users, admin, notifications) */
    #[ORM\Column(type: 'string', length: 50)]
    #[Groups(['permission:read'])]
    private string $category = '';

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

    public function getCategory(): string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;

        return $this;
    }
}
