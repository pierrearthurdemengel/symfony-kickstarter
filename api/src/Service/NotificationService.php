<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Service de creation de notifications utilisateur.
 * Publie egalement les notifications en temps reel via Mercure.
 */
final readonly class NotificationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private MercurePublisher $mercurePublisher,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * Cree et persiste une notification pour un utilisateur.
     */
    public function notify(
        User $user,
        string $title,
        string $type = 'info',
        ?string $message = null,
        ?string $link = null,
    ): Notification {
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setTitle($title);
        $notification->setType($type);
        $notification->setMessage($message);
        $notification->setLink($link);

        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        $this->publishToMercure($notification);

        return $notification;
    }

    /**
     * Cree des notifications pour plusieurs utilisateurs.
     *
     * @param User[] $users
     */
    public function notifyMany(
        array $users,
        string $title,
        string $type = 'info',
        ?string $message = null,
        ?string $link = null,
    ): void {
        $notifications = [];

        foreach ($users as $user) {
            $notification = new Notification();
            $notification->setUser($user);
            $notification->setTitle($title);
            $notification->setType($type);
            $notification->setMessage($message);
            $notification->setLink($link);

            $this->entityManager->persist($notification);
            $notifications[] = $notification;
        }

        $this->entityManager->flush();

        foreach ($notifications as $notification) {
            $this->publishToMercure($notification);
        }
    }

    /**
     * Publie une notification en temps reel via Mercure.
     */
    private function publishToMercure(Notification $notification): void
    {
        try {
            $userId = (string) $notification->getUser()?->getId();
            if ('' === $userId) {
                return;
            }

            $this->mercurePublisher->publishUserNotification($userId, [
                'id' => (string) $notification->getId(),
                'title' => $notification->getTitle(),
                'message' => $notification->getMessage(),
                'type' => $notification->getType(),
                'link' => $notification->getLink(),
                'createdAt' => $notification->getCreatedAt()->format('c'),
            ]);
        } catch (\Throwable $e) {
            // Mercure indisponible : la notification est deja en base, pas de perte
            $this->logger->warning('Echec de publication Mercure : {message}', [
                'message' => $e->getMessage(),
            ]);
        }
    }
}
