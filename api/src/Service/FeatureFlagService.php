<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

/**
 * Service de feature flags.
 * Stocke les flags en cache Redis avec possibilite de mise a jour dynamique.
 * Les flags par defaut sont configures dans le constructeur.
 */
final class FeatureFlagService
{
    /** @var array<string, bool> Flags par defaut */
    private const DEFAULT_FLAGS = [
        'oauth_google' => true,
        'oauth_github' => true,
        'two_factor_auth' => true,
        'user_registration' => true,
        'maintenance_mode' => false,
        'dark_mode' => true,
        'notifications_realtime' => true,
        'search_enabled' => true,
    ];

    private const CACHE_KEY = 'feature_flags';
    private const CACHE_TTL = 300;

    public function __construct(
        private readonly CacheInterface $cache,
    ) {
    }

    /**
     * Verifie si un feature flag est active.
     */
    public function isEnabled(string $flag): bool
    {
        $flags = $this->getAllFlags();

        return $flags[$flag] ?? false;
    }

    /**
     * Retourne tous les feature flags.
     *
     * @return array<string, bool>
     */
    public function getAllFlags(): array
    {
        /** @var array<string, bool> $flags */
        $flags = $this->cache->get(self::CACHE_KEY, function (ItemInterface $item): array {
            $item->expiresAfter(self::CACHE_TTL);

            return self::DEFAULT_FLAGS;
        });

        return $flags;
    }

    /**
     * Met a jour un feature flag.
     */
    public function setFlag(string $flag, bool $enabled): void
    {
        $flags = $this->getAllFlags();
        $flags[$flag] = $enabled;

        $this->cache->delete(self::CACHE_KEY);
        $this->cache->get(self::CACHE_KEY, function (ItemInterface $item) use ($flags): array {
            $item->expiresAfter(self::CACHE_TTL);

            return $flags;
        });
    }
}
