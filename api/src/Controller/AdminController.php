<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\AuditLogRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Endpoints d'administration (ROLE_ADMIN requis via access_control).
 */
final class AdminController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly AuditLogRepository $auditLogRepository,
        private readonly SerializerInterface $serializer,
    ) {
    }

    /**
     * Statistiques avancees pour le dashboard admin.
     * Retourne les comptages, inscriptions par mois et repartition des roles.
     */
    #[Route('/api/admin/stats', name: 'api_admin_stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $userRepo = $this->entityManager->getRepository(User::class);

        // Total utilisateurs
        $totalUsers = (int) $userRepo->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->getQuery()
            ->getSingleScalarResult();

        // Utilisateurs avec email verifie
        $verifiedUsers = (int) $userRepo->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.isEmailVerified = true')
            ->getQuery()
            ->getSingleScalarResult();

        // Inscriptions par mois (12 derniers mois) - requete native pour TO_CHAR PostgreSQL
        $conn = $this->entityManager->getConnection();

        /** @var array<int, array{month: string, count: string}> $registrationsByMonth */
        $registrationsByMonth = $conn->fetchAllAssociative(
            "SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(id) as count
             FROM \"user\"
             WHERE created_at >= :since
             GROUP BY TO_CHAR(created_at, 'YYYY-MM')
             ORDER BY month ASC",
            ['since' => (new \DateTimeImmutable('-12 months'))->format('Y-m-d H:i:s')],
        );

        // Repartition des roles
        /** @var array<int, array{roles: string}> $allRoles */
        $allRoles = $userRepo->createQueryBuilder('u')
            ->select('u.roles')
            ->getQuery()
            ->getResult();

        $roleDistribution = [];
        foreach ($allRoles as $row) {
            /** @var list<string> $roles */
            $roles = $row['roles'];
            foreach ($roles as $role) {
                $roleDistribution[$role] = ($roleDistribution[$role] ?? 0) + 1;
            }
        }
        // ROLE_USER est implicite pour tous les utilisateurs
        $roleDistribution['ROLE_USER'] = $totalUsers;

        // Actions d'audit recentes
        $auditCounts = $this->auditLogRepository->countByAction(30);

        return $this->json([
            'totalUsers' => $totalUsers,
            'verifiedUsers' => $verifiedUsers,
            'verificationRate' => $totalUsers > 0
                ? round(($verifiedUsers / $totalUsers) * 100, 1)
                : 0,
            'registrationsByMonth' => array_map(
                fn (array $row): array => [
                    'month' => $row['month'],
                    'count' => (int) $row['count'],
                ],
                $registrationsByMonth,
            ),
            'roleDistribution' => $roleDistribution,
            'auditCounts' => $auditCounts,
        ]);
    }

    /**
     * Export CSV de la liste des utilisateurs.
     */
    #[Route('/api/admin/users/export', name: 'api_admin_users_export', methods: ['GET'])]
    public function exportUsers(): StreamedResponse
    {
        /** @var User[] $users */
        $users = $this->entityManager->getRepository(User::class)
            ->createQueryBuilder('u')
            ->orderBy('u.createdAt', 'DESC')
            ->getQuery()
            ->getResult();

        $response = new StreamedResponse(function () use ($users): void {
            /** @var resource $handle */
            $handle = fopen('php://output', 'w');

            // En-tete CSV
            fputcsv($handle, [
                'ID',
                'Email',
                'Prenom',
                'Nom',
                'Roles',
                'Email verifie',
                'Date inscription',
                'Derniere connexion',
            ], ';');

            // Lignes de donnees
            foreach ($users as $user) {
                fputcsv($handle, [
                    (string) $user->getId(),
                    $user->getEmail(),
                    $user->getFirstName() ?? '',
                    $user->getLastName() ?? '',
                    implode(', ', $user->getRoles()),
                    $user->isEmailVerified() ? 'Oui' : 'Non',
                    $user->getCreatedAt()?->format('Y-m-d H:i:s') ?? '',
                    $user->getLastLoginAt()?->format('Y-m-d H:i:s') ?? '',
                ], ';');
            }

            fclose($handle);
        });

        $filename = 'utilisateurs_' . date('Ymd_His') . '.csv';
        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', "attachment; filename=\"{$filename}\"");

        return $response;
    }

    /**
     * Liste paginee du journal d'audit.
     */
    #[Route('/api/admin/audit-logs', name: 'api_admin_audit_logs', methods: ['GET'])]
    public function auditLogs(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(100, max(1, $request->query->getInt('limit', 30)));
        $offset = ($page - 1) * $limit;

        $logs = $this->auditLogRepository->findRecent($limit, $offset);
        $total = $this->auditLogRepository->countAll();

        $data = json_decode(
            $this->serializer->serialize($logs, 'json', ['groups' => ['audit:read']]),
            true,
        );

        return $this->json([
            'items' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }
}
