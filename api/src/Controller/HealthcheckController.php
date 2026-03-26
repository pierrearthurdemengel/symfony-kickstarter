<?php

declare(strict_types=1);

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Cache\CacheInterface;

final class HealthcheckController extends AbstractController
{
    public function __construct(
        private readonly Connection $connection,
        private readonly CacheInterface $cache,
    ) {
    }

    #[Route('/api/healthcheck', name: 'api_healthcheck', methods: ['GET'])]
    public function __invoke(): JsonResponse
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
        ];

        $allOk = !in_array('error', $checks, true);

        $statusCode = $allOk ? Response::HTTP_OK : Response::HTTP_SERVICE_UNAVAILABLE;

        return $this->json([
            'status' => $allOk ? 'ok' : 'degraded',
            'checks' => $checks,
            'timestamp' => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
            'version' => '0.1.0',
        ], $statusCode);
    }

    /**
     * Verification de la connexion a la base de donnees.
     */
    private function checkDatabase(): string
    {
        try {
            $this->connection->executeQuery('SELECT 1');

            return 'ok';
        } catch (\Throwable) {
            return 'error';
        }
    }

    /**
     * Verification de la connexion a Redis via le cache pool.
     */
    private function checkRedis(): string
    {
        try {
            $this->cache->get('healthcheck_ping', function (): string {
                return 'pong';
            });

            return 'ok';
        } catch (\Throwable) {
            return 'error';
        }
    }
}
