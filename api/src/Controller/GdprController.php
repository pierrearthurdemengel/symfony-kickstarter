<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\User;
use App\Service\AuditLogger;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoints RGPD : export de donnees personnelles et suppression de compte.
 */
final class GdprController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    /**
     * Exporte toutes les donnees personnelles de l'utilisateur (droit d'acces RGPD).
     */
    #[Route('/api/me/export', name: 'api_me_export', methods: ['GET'])]
    public function export(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        // Notifications
        $notifications = $this->entityManager->getRepository(Notification::class)->findBy(
            ['user' => $user],
            ['createdAt' => 'DESC'],
        );

        $notificationData = [];
        foreach ($notifications as $notif) {
            $notificationData[] = [
                'title' => $notif->getTitle(),
                'message' => $notif->getMessage(),
                'type' => $notif->getType(),
                'isRead' => $notif->isRead(),
                'createdAt' => $notif->getCreatedAt()->format('c'),
            ];
        }

        $data = [
            'account' => [
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'roles' => $user->getRoles(),
                'isEmailVerified' => $user->isEmailVerified(),
                'isTwoFactorEnabled' => $user->isTwoFactorEnabled(),
                'createdAt' => $user->getCreatedAt()?->format('c'),
                'updatedAt' => $user->getUpdatedAt()?->format('c'),
                'lastLoginAt' => $user->getLastLoginAt()?->format('c'),
            ],
            'notifications' => $notificationData,
            'exportDate' => (new DateTimeImmutable())->format('c'),
        ];

        $this->auditLogger->log('gdpr_export', 'User', (string) $user->getId());

        return $this->json($data);
    }

    /**
     * Supprime le compte de l'utilisateur (droit a l'effacement RGPD).
     * Necessite le mot de passe actuel comme confirmation.
     */
    #[Route('/api/me/delete', name: 'api_me_delete', methods: ['POST'])]
    public function deleteAccount(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        /** @var array{password?: string} $data */
        $data = json_decode($request->getContent(), true);
        $password = $data['password'] ?? '';

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Mot de passe incorrect.'], Response::HTTP_BAD_REQUEST);
        }

        // Interdiction de supprimer un admin
        if (\in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return $this->json(
                ['error' => 'Les comptes administrateurs ne peuvent pas etre supprimes via cette methode.'],
                Response::HTTP_FORBIDDEN,
            );
        }

        $this->auditLogger->log('gdpr_account_deletion', 'User', (string) $user->getId(), [
            'email' => $user->getEmail(),
        ]);

        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
