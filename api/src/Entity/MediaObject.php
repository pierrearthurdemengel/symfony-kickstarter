<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Controller\MediaUploadController;
use App\Repository\MediaObjectRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: MediaObjectRepository::class)]
#[ORM\Table(name: 'media_object')]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['media:read']],
        ),
        new Get(
            normalizationContext: ['groups' => ['media:read']],
        ),
        new Post(
            controller: MediaUploadController::class,
            normalizationContext: ['groups' => ['media:read']],
            deserialize: false,
            openapiContext: [
                'requestBody' => [
                    'content' => [
                        'multipart/form-data' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'file' => [
                                        'type' => 'string',
                                        'format' => 'binary',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['media:read']],
)]
class MediaObject
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['media:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(type: 'string', length: 512)]
    #[Groups(['media:read'])]
    private ?string $filePath = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['media:read'])]
    private ?string $originalName = null;

    #[ORM\Column(type: 'string', length: 100)]
    #[Groups(['media:read'])]
    private ?string $mimeType = null;

    #[ORM\Column(type: 'integer')]
    #[Groups(['media:read'])]
    private ?int $size = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['media:read'])]
    private ?User $uploadedBy = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['media:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getFilePath(): ?string
    {
        return $this->filePath;
    }

    public function setFilePath(string $filePath): static
    {
        $this->filePath = $filePath;

        return $this;
    }

    public function getOriginalName(): ?string
    {
        return $this->originalName;
    }

    public function setOriginalName(string $originalName): static
    {
        $this->originalName = $originalName;

        return $this;
    }

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function setMimeType(string $mimeType): static
    {
        $this->mimeType = $mimeType;

        return $this;
    }

    public function getSize(): ?int
    {
        return $this->size;
    }

    public function setSize(int $size): static
    {
        $this->size = $size;

        return $this;
    }

    public function getUploadedBy(): ?User
    {
        return $this->uploadedBy;
    }

    public function setUploadedBy(?User $uploadedBy): static
    {
        $this->uploadedBy = $uploadedBy;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
