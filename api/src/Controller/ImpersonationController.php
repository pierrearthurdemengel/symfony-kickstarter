<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Service\AuditLogger;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoints d'impersonation admin.
 * Permet a un admin de se connecter en tant qu'un autre utilisateur
 * tout en conservant la possibilite de revenir a son compte.
 */
final class ImpersonationController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    /**
     * Impersonne un utilisateur cible.
     * Genere un JWT pour l'utilisateur cible avec un claim 'impersonator'.
     */
    #[Route('/api/admin/impersonate/{userId}', name: 'api_admin_impersonate', methods: ['POST'])]
    public function impersonate(string $userId): JsonResponse
    {
        /** @var User $admin */
        $admin = $this->getUser();

        // Verification que l'utilisateur cible existe
        $targetUser = $this->entityManager->getRepository(User::class)->find($userId);
        if (!$targetUser instanceof User) {
            return $this->json(['error' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Interdiction d'impersonner un autre admin
        if (\in_array('ROLE_ADMIN', $targetUser->getRoles(), true)) {
            return $this->json(
                ['error' => 'Impossible d\'impersonner un administrateur.'],
                Response::HTTP_FORBIDDEN,
            );
        }

        // Interdiction de s'impersonner soi-meme
        if ($admin->getId()?->equals($targetUser->getId())) {
            return $this->json(
                ['error' => 'Impossible de s\'impersonner soi-meme.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        // Log dans l'audit
        $this->auditLogger->log(
            'impersonate_start',
            'User',
            (string) $targetUser->getId(),
            ['admin' => (string) $admin->getId(), 'target' => (string) $targetUser->getEmail()],
        );

        // Generation du JWT avec claim d'impersonation
        $token = $this->jwtManager->createFromPayload($targetUser, [
            'impersonator' => (string) $admin->getId(),
        ]);

        return $this->json([
            'token' => $token,
            'impersonatedUser' => [
                'id' => (string) $targetUser->getId(),
                'email' => $targetUser->getEmail(),
                'firstName' => $targetUser->getFirstName(),
                'lastName' => $targetUser->getLastName(),
            ],
        ]);
    }

    /**
     * Arrete l'impersonation et retourne le JWT de l'admin original.
     */
    #[Route('/api/admin/stop-impersonation', name: 'api_admin_stop_impersonation', methods: ['POST'])]
    public function stopImpersonation(Request $request): JsonResponse
    {
        // Lecture du claim impersonator depuis le token actuel
        $tokenString = str_replace('Bearer ', '', $request->headers->get('Authorization', ''));

        try {
            /** @var array{impersonator?: string} $payload */
            $payload = $this->jwtManager->parse($tokenString);
        } catch (\Throwable) {
            return $this->json(['error' => 'Token invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $impersonatorId = $payload['impersonator'] ?? null;
        if (null === $impersonatorId) {
            return $this->json(
                ['error' => 'Aucune impersonation active.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        // Recuperation de l'admin original
        $admin = $this->entityManager->getRepository(User::class)->find($impersonatorId);
        if (!$admin instanceof User) {
            return $this->json(['error' => 'Administrateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Log dans l'audit
        $this->auditLogger->log(
            'impersonate_stop',
            'User',
            (string) $admin->getId(),
            ['admin' => (string) $admin->getId()],
        );

        // Generation du JWT normal pour l'admin
        $token = $this->jwtManager->create($admin);

        return $this->json(['token' => $token]);
    }
}
