<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\RefreshToken;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<RefreshToken>
 */
class RefreshTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RefreshToken::class);
    }

    /**
     * Recherche un refresh token valide (existant, non expire, non revoque).
     */
    public function findValidToken(string $token): ?RefreshToken
    {
        /** @var RefreshToken|null $refreshToken */
        $refreshToken = $this->createQueryBuilder('rt')
            ->where('rt.token = :token')
            ->andWhere('rt.expiresAt > :now')
            ->andWhere('rt.isRevoked = false')
            ->setParameter('token', $token)
            ->setParameter('now', new DateTimeImmutable())
            ->getQuery()
            ->getOneOrNullResult();

        return $refreshToken;
    }

    /**
     * Revoque tous les refresh tokens d'un utilisateur.
     */
    public function revokeAllForUser(User $user): int
    {
        return (int) $this->createQueryBuilder('rt')
            ->update()
            ->set('rt.isRevoked', 'true')
            ->where('rt.user = :user')
            ->andWhere('rt.isRevoked = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }

    /**
     * Supprime les tokens expires ou revoques (nettoyage periodique).
     */
    public function deleteExpiredTokens(): int
    {
        return (int) $this->createQueryBuilder('rt')
            ->delete()
            ->where('rt.expiresAt < :now')
            ->orWhere('rt.isRevoked = true')
            ->setParameter('now', new DateTimeImmutable())
            ->getQuery()
            ->execute();
    }

    /**
     * Compte les tokens actifs d'un utilisateur.
     */
    public function countActiveTokensForUser(User $user): int
    {
        /** @var int $count */
        $count = $this->createQueryBuilder('rt')
            ->select('COUNT(rt.id)')
            ->where('rt.user = :user')
            ->andWhere('rt.isRevoked = false')
            ->andWhere('rt.expiresAt > :now')
            ->setParameter('user', $user)
            ->setParameter('now', new DateTimeImmutable())
            ->getQuery()
            ->getSingleScalarResult();

        return $count;
    }
}
