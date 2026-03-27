<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Permission;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Permission>
 */
final class PermissionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Permission::class);
    }

    /**
     * Retourne les permissions regroupees par categorie.
     *
     * @return array<string, Permission[]>
     */
    public function findGroupedByCategory(): array
    {
        $permissions = $this->createQueryBuilder('p')
            ->orderBy('p.category', 'ASC')
            ->addOrderBy('p.name', 'ASC')
            ->getQuery()
            ->getResult();

        $grouped = [];
        foreach ($permissions as $permission) {
            $grouped[$permission->getCategory()][] = $permission;
        }

        return $grouped;
    }
}
