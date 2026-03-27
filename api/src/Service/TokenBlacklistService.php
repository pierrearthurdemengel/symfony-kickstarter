<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;

/**
 * Gestion de la blacklist des access tokens JWT revoques via Redis.
 * Les tokens blacklistes sont stockes avec un TTL egal au temps restant avant expiration.
 */
final readonly class TokenBlacklistService
{
    private const string PREFIX = 'jwt_blacklist:';

    public function __construct(
        private \Redis $redis,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * Ajoute un access token a la blacklist Redis.
     * Le token est identifie par son JTI (JWT ID) ou le hash du token.
     */
    public function blacklist(string $tokenIdentifier, int $ttl): void
    {
        if ($ttl <= 0) {
            return;
        }

        $key = self::PREFIX . $tokenIdentifier;
        $this->redis->setex($key, $ttl, '1');

        $this->logger->info('Access token blackliste.', [
            'identifier' => substr($tokenIdentifier, 0, 8) . '...',
            'ttl' => $ttl,
        ]);
    }

    /**
     * Verifie si un access token est blackliste.
     */
    public function isBlacklisted(string $tokenIdentifier): bool
    {
        $key = self::PREFIX . $tokenIdentifier;

        return (bool) $this->redis->exists($key);
    }
}
