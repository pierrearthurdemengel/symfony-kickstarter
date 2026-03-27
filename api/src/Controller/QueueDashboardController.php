<?php

declare(strict_types=1);

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Dashboard de monitoring des files d'attente Messenger.
 * Accessible uniquement aux administrateurs.
 */
final class QueueDashboardController extends AbstractController
{
    public function __construct(
        private readonly Connection $connection,
    ) {
    }

    /**
     * Retourne les statistiques des messages en file d'attente.
     */
    #[Route('/api/admin/queue/stats', name: 'api_admin_queue_stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        // Comptage des messages en attente
        $pending = $this->countMessages('async', false);
        $failed = $this->countMessages('failed', false);

        // Messages recents traites (derniere heure)
        $recentDelivered = $this->countRecentDelivered();

        return $this->json([
            'pending' => $pending,
            'failed' => $failed,
            'recentDelivered' => $recentDelivered,
        ]);
    }

    /**
     * Liste les messages en echec.
     */
    #[Route('/api/admin/queue/failed', name: 'api_admin_queue_failed', methods: ['GET'])]
    public function failedMessages(): JsonResponse
    {
        try {
            /** @var list<array{id: int, body: string, headers: string, queue_name: string, created_at: string}> $messages */
            $messages = $this->connection->fetchAllAssociative(
                "SELECT id, body, headers, queue_name, created_at
                 FROM messenger_messages
                 WHERE queue_name = 'failed'
                 ORDER BY created_at DESC
                 LIMIT 50",
            );

            $result = [];
            foreach ($messages as $msg) {
                /** @var array<string, mixed> $headers */
                $headers = json_decode($msg['headers'], true) ?? [];
                $result[] = [
                    'id' => $msg['id'],
                    'queueName' => $msg['queue_name'],
                    'createdAt' => $msg['created_at'],
                    'type' => $headers['type'] ?? 'unknown',
                ];
            }

            return $this->json($result);
        } catch (\Throwable) {
            return $this->json([]);
        }
    }

    /**
     * Retente un message en echec.
     */
    #[Route('/api/admin/queue/retry/{id}', name: 'api_admin_queue_retry', methods: ['POST'])]
    public function retryMessage(int $id): JsonResponse
    {
        try {
            // Deplace le message de 'failed' vers 'async'
            $updated = $this->connection->executeStatement(
                "UPDATE messenger_messages SET queue_name = 'async', available_at = NOW(), delivered_at = NULL WHERE id = :id AND queue_name = 'failed'",
                ['id' => $id],
            );

            if ($updated === 0) {
                return $this->json(['error' => 'Message introuvable.'], 404);
            }

            return $this->json(['message' => 'Message remis en file d\'attente.']);
        } catch (\Throwable) {
            return $this->json(['error' => 'Erreur lors de la retentative.'], 500);
        }
    }

    private function countMessages(string $queueName, bool $delivered): int
    {
        try {
            $sql = "SELECT COUNT(*) FROM messenger_messages WHERE queue_name = :queue";
            if ($delivered) {
                $sql .= " AND delivered_at IS NOT NULL";
            } else {
                $sql .= " AND delivered_at IS NULL";
            }

            return (int) $this->connection->fetchOne($sql, ['queue' => $queueName]);
        } catch (\Throwable) {
            return 0;
        }
    }

    private function countRecentDelivered(): int
    {
        try {
            return (int) $this->connection->fetchOne(
                "SELECT COUNT(*) FROM messenger_messages WHERE delivered_at IS NOT NULL AND delivered_at >= NOW() - INTERVAL '1 hour'",
            );
        } catch (\Throwable) {
            return 0;
        }
    }
}
