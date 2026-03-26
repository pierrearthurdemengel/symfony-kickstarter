<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\ResetPasswordToken;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ResetPasswordToken>
 */
class ResetPasswordTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ResetPasswordToken::class);
    }

    /**
     * Recherche un token valide (existant et non expire).
     */
    public function findValidToken(string $token): ?ResetPasswordToken
    {
        /** @var ResetPasswordToken|null $resetToken */
        $resetToken = $this->createQueryBuilder('rpt')
            ->where('rpt.token = :token')
            ->andWhere('rpt.expiresAt > :now')
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->getOneOrNullResult();

        return $resetToken;
    }

    /**
     * Supprime tous les tokens expires.
     */
    public function deleteExpiredTokens(): void
    {
        $this->createQueryBuilder('rpt')
            ->delete()
            ->where('rpt.expiresAt < :now')
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->execute();
    }
}
