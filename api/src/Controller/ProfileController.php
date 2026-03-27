<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Endpoints du profil utilisateur connecte.
 */
final class ProfileController extends AbstractController
{
    public function __construct(
        private readonly SerializerInterface $serializer,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    /**
     * Retourne le profil de l'utilisateur connecte.
     */
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode(
            $this->serializer->serialize($user, 'json', ['groups' => ['user:read']]),
            true,
        );

        // Ajout des permissions pour le frontend
        $data['permissions'] = $user->getAllPermissions();

        return $this->json($data);
    }

    /**
     * Met a jour le profil de l'utilisateur connecte.
     */
    #[Route('/api/me', name: 'api_me_update', methods: ['PATCH'])]
    public function update(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        /** @var array{firstName?: string, lastName?: string} $data */
        $data = json_decode($request->getContent(), true);

        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }

        return $this->me();
    }

    /**
     * Change le mot de passe de l'utilisateur connecte.
     */
    #[Route('/api/me/password', name: 'api_me_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        /** @var array{currentPassword?: string, newPassword?: string} $data */
        $data = json_decode($request->getContent(), true);

        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
            return $this->json(
                ['error' => 'Mot de passe actuel incorrect.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        if (\strlen($newPassword) < 8) {
            return $this->json(
                ['error' => 'Le nouveau mot de passe doit contenir au moins 8 caracteres.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $newPassword));

        return $this->json(['message' => 'Mot de passe modifie avec succes.']);
    }
}
