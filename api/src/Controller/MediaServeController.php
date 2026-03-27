<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;

final class MediaServeController extends AbstractController
{
    #[Route('/uploads/{filename}', name: 'api_media_serve', methods: ['GET'])]
    public function __invoke(string $filename): Response
    {
        /** @var string $projectDir */
        $projectDir = $this->getParameter('kernel.project_dir');
        $filePath = $projectDir.'/var/uploads/'.$filename;

        if (!file_exists($filePath)) {
            return $this->json(
                ['error' => 'Fichier introuvable.'],
                Response::HTTP_NOT_FOUND,
            );
        }

        $response = new BinaryFileResponse($filePath);
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_INLINE, $filename);

        $mimeType = mime_content_type($filePath);
        if (\is_string($mimeType)) {
            $response->headers->set('Content-Type', $mimeType);
        }

        return $response;
    }
}
