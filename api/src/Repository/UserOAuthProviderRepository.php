<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\UserOAuthProvider;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserOAuthProvider>
 */
final class UserOAuthProviderRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserOAuthProvider::class);
    }

    /**
     * Recherche par fournisseur et identifiant fournisseur.
     */
    public function findByProviderAndProviderId(string $provider, string $providerUserId): ?UserOAuthProvider
    {
        return $this->findOneBy([
            'provider' => $provider,
            'providerUserId' => $providerUserId,
        ]);
    }

    /**
     * Retourne les fournisseurs lies a un utilisateur.
     *
     * @return UserOAuthProvider[]
     */
    public function findByUser(\App\Entity\User $user): array
    {
        return $this->findBy(['user' => $user]);
    }
}
