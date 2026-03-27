<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Endpoints de gestion des notifications utilisateur.
 * L'utilisateur connecte ne voit que ses propres notifications.
 */
final class NotificationController extends AbstractController
{
    public function __construct(
        private readonly NotificationRepository $notificationRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
    ) {
    }

    /**
     * Liste paginee des notifications de l'utilisateur connecte.
     */
    #[Route('/api/notifications', name: 'api_notifications_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(50, max(1, $request->query->getInt('limit', 20)));
        $offset = ($page - 1) * $limit;

        $notifications = $this->notificationRepository->findByUser($user, $limit, $offset);
        $total = $this->notificationRepository->countByUser($user);
        $unread = $this->notificationRepository->countUnreadByUser($user);

        $data = json_decode(
            $this->serializer->serialize($notifications, 'json', ['groups' => ['notification:read']]),
            true,
        );

        return $this->json([
            'items' => $data,
            'total' => $total,
            'unread' => $unread,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => $total > 0 ? (int) ceil($total / $limit) : 1,
        ]);
    }

    /**
     * Nombre de notifications non lues (pour le badge).
     */
    #[Route('/api/notifications/unread-count', name: 'api_notifications_unread_count', methods: ['GET'])]
    public function unreadCount(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json([
            'count' => $this->notificationRepository->countUnreadByUser($user),
        ]);
    }

    /**
     * Marque une notification comme lue.
     */
    #[Route('/api/notifications/{id}/read', name: 'api_notifications_mark_read', methods: ['PATCH'])]
    public function markAsRead(string $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $notification = $this->notificationRepository->find($id);

        if (!$notification instanceof Notification) {
            return $this->json(['message' => 'Notification introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Verification que la notification appartient a l'utilisateur
        if ($notification->getUser()?->getId()?->toRfc4122() !== $user->getId()?->toRfc4122()) {
            return $this->json(['message' => 'Acces interdit.'], Response::HTTP_FORBIDDEN);
        }

        $notification->setIsRead(true);
        $this->entityManager->flush();

        return $this->json(['message' => 'Notification marquee comme lue.']);
    }

    /**
     * Marque toutes les notifications de l'utilisateur comme lues.
     */
    #[Route('/api/notifications/mark-all-read', name: 'api_notifications_mark_all_read', methods: ['POST'])]
    public function markAllAsRead(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $count = $this->notificationRepository->markAllAsRead($user);

        return $this->json([
            'message' => "{$count} notification(s) marquee(s) comme lue(s).",
            'count' => $count,
        ]);
    }

    /**
     * Supprime une notification.
     */
    #[Route('/api/notifications/{id}', name: 'api_notifications_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $notification = $this->notificationRepository->find($id);

        if (!$notification instanceof Notification) {
            return $this->json(['message' => 'Notification introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Verification que la notification appartient a l'utilisateur
        if ($notification->getUser()?->getId()?->toRfc4122() !== $user->getId()?->toRfc4122()) {
            return $this->json(['message' => 'Acces interdit.'], Response::HTTP_FORBIDDEN);
        }

        $this->entityManager->remove($notification);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
