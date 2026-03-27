<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

/**
 * Service de publication Mercure pour les evenements temps reel.
 */
final readonly class MercurePublisher
{
    public function __construct(
        private HubInterface $hub,
    ) {
    }

    /**
     * Publie une mise a jour sur un topic Mercure.
     *
     * @param string|list<string> $topics
     * @param array<string, mixed> $data
     * @param bool $private Publication privee (necessite autorisation)
     */
    public function publish(string|array $topics, array $data, bool $private = true): void
    {
        $update = new Update(
            $topics,
            (string) json_encode($data, JSON_THROW_ON_ERROR),
            $private,
        );

        $this->hub->publish($update);
    }

    /**
     * Publie une notification a un utilisateur specifique.
     *
     * @param array<string, mixed> $notification
     */
    public function publishUserNotification(string $userId, array $notification): void
    {
        $this->publish(
            sprintf('/users/%s/notifications', $userId),
            $notification,
        );
    }
}
