<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\AuditLog;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AuditLog>
 */
class AuditLogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AuditLog::class);
    }

    /**
     * Recupere les entrees recentes du journal d'audit.
     *
     * @return AuditLog[]
     */
    public function findRecent(int $limit = 50, int $offset = 0): array
    {
        return $this->createQueryBuilder('a')
            ->orderBy('a.createdAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Compte le nombre total d'entrees.
     */
    public function countAll(): int
    {
        return (int) $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Compte les actions par type sur les N derniers jours.
     *
     * @return array<int, array{action: string, total: int}>
     */
    public function countByAction(int $days = 30): array
    {
        $since = new \DateTimeImmutable("-{$days} days");

        /** @var array<int, array{action: string, total: string}> $results */
        $results = $this->createQueryBuilder('a')
            ->select('a.action, COUNT(a.id) as total')
            ->where('a.createdAt >= :since')
            ->setParameter('since', $since)
            ->groupBy('a.action')
            ->getQuery()
            ->getResult();

        return array_map(
            fn (array $row): array => ['action' => $row['action'], 'total' => (int) $row['total']],
            $results,
        );
    }

    /**
     * Supprime les entrees de plus de N jours.
     */
    public function deleteOlderThan(int $days): int
    {
        $before = new \DateTimeImmutable("-{$days} days");

        return (int) $this->createQueryBuilder('a')
            ->delete()
            ->where('a.createdAt < :before')
            ->setParameter('before', $before)
            ->getQuery()
            ->execute();
    }
}
