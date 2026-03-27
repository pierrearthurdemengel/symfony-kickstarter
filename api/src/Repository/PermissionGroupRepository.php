<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\PermissionGroup;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PermissionGroup>
 */
final class PermissionGroupRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PermissionGroup::class);
    }

    /**
     * Retourne tous les groupes avec leurs permissions pre-chargees.
     *
     * @return PermissionGroup[]
     */
    public function findAllWithPermissions(): array
    {
        return $this->createQueryBuilder('g')
            ->leftJoin('g.permissions', 'p')
            ->addSelect('p')
            ->orderBy('g.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
