<?php

declare(strict_types=1);

namespace App\Controller;

use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Cache\CacheInterface;
use Throwable;

/**
 * Endpoints de sante applicative.
 * - /api/healthcheck : verification complete (readiness probe K8s)
 * - /api/healthcheck/live : verification legere (liveness probe K8s).
 */
final class HealthcheckController extends AbstractController
{
    public function __construct(
        private readonly Connection $connection,
        private readonly CacheInterface $cache,
    ) {
    }

    /**
     * Readiness probe : verifie que l'application et ses dependances sont operationnelles.
     * Utiliser comme readiness probe Kubernetes (le pod ne recoit du trafic que si toutes les dependances repondent).
     */
    #[Route('/api/healthcheck', name: 'api_healthcheck', methods: ['GET'])]
    public function readiness(): JsonResponse
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
        ];

        $allOk = !\in_array('error', $checks, true);

        $statusCode = $allOk ? Response::HTTP_OK : Response::HTTP_SERVICE_UNAVAILABLE;

        return $this->json([
            'status' => $allOk ? 'ok' : 'degraded',
            'checks' => $checks,
            'timestamp' => (new DateTimeImmutable())->format(DateTimeInterface::ATOM),
            'version' => '1.0.0',
        ], $statusCode);
    }

    /**
     * Liveness probe : verifie uniquement que le processus PHP repond.
     * Utiliser comme liveness probe Kubernetes (le pod est redemarre s'il ne repond plus).
     * Ne teste pas les dependances externes pour eviter les faux positifs.
     */
    #[Route('/api/healthcheck/live', name: 'api_healthcheck_live', methods: ['GET'])]
    public function liveness(): JsonResponse
    {
        return $this->json([
            'status' => 'alive',
            'timestamp' => (new DateTimeImmutable())->format(DateTimeInterface::ATOM),
        ]);
    }

    /**
     * Verification de la connexion a la base de donnees.
     */
    private function checkDatabase(): string
    {
        try {
            $this->connection->executeQuery('SELECT 1');

            return 'ok';
        } catch (Throwable) {
            return 'error';
        }
    }

    /**
     * Verification de la connexion a Redis via le cache pool.
     */
    private function checkRedis(): string
    {
        try {
            $this->cache->get('healthcheck_ping', static function (): string {
                return 'pong';
            });

            return 'ok';
        } catch (Throwable) {
            return 'error';
        }
    }
}
