<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\MediaObject;
use App\Entity\User;
use DateTimeInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Uid\Uuid;

final class MediaUploadController extends AbstractController
{
    /** @var list<string> Types MIME autorises */
    private const array ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
    ];

    /** Taille maximale en octets (10 Mo) */
    private const int MAX_FILE_SIZE = 10 * 1024 * 1024;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $file = $request->files->get('file');

        if (!$file instanceof UploadedFile) {
            return $this->json(
                ['error' => 'Aucun fichier envoye. Le champ "file" est requis.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        // Verification de la taille en priorite (evite la detection MIME sur les gros fichiers)
        $fileSize = $file->getSize();
        if (false === $fileSize || $fileSize > self::MAX_FILE_SIZE) {
            return $this->json(
                ['error' => 'Le fichier depasse la taille maximale autorisee de 10 Mo.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $mimeType = $file->getMimeType() ?? '';
        if (!\in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            return $this->json(
                ['error' => 'Type de fichier non autorise. Types acceptes : JPEG, PNG, WebP, PDF.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $originalName = $file->getClientOriginalName();
        $extension = $file->guessExtension() ?? 'bin';
        $uniqueName = Uuid::v7()->toRfc4122().'.'.$extension;

        /** @var string $projectDir */
        $projectDir = $this->getParameter('kernel.project_dir');
        $uploadDir = $projectDir.'/var/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $file->move($uploadDir, $uniqueName);

        $user = $this->getUser();

        $media = new MediaObject();
        $media->setFilePath($uniqueName);
        $media->setOriginalName($originalName);
        $media->setMimeType($mimeType);
        $media->setSize($fileSize);
        $media->setUploadedBy($user instanceof User ? $user : null);

        $this->entityManager->persist($media);
        $this->entityManager->flush();

        return $this->json([
            'id' => (string) $media->getId(),
            'filePath' => $media->getFilePath(),
            'originalName' => $media->getOriginalName(),
            'mimeType' => $media->getMimeType(),
            'size' => $media->getSize(),
            'createdAt' => $media->getCreatedAt()?->format(DateTimeInterface::ATOM),
        ], Response::HTTP_CREATED);
    }
}
