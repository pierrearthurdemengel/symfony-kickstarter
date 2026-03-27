<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Permission;
use App\Entity\PermissionGroup;
use App\Repository\PermissionGroupRepository;
use App\Repository\PermissionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * CRUD des permissions et groupes de permissions (admin uniquement).
 */
final class PermissionController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly PermissionRepository $permissionRepository,
        private readonly PermissionGroupRepository $groupRepository,
        private readonly SerializerInterface $serializer,
    ) {
    }

    /**
     * Liste toutes les permissions regroupees par categorie.
     */
    #[Route('/api/admin/permissions', name: 'api_admin_permissions', methods: ['GET'])]
    public function listPermissions(): JsonResponse
    {
        $grouped = $this->permissionRepository->findGroupedByCategory();
        $result = [];

        foreach ($grouped as $category => $permissions) {
            $result[] = [
                'category' => $category,
                'permissions' => json_decode(
                    $this->serializer->serialize($permissions, 'json', ['groups' => ['permission:read']]),
                    true,
                ),
            ];
        }

        return $this->json($result);
    }

    /**
     * Liste tous les groupes de permissions avec leurs permissions.
     */
    #[Route('/api/admin/permission-groups', name: 'api_admin_permission_groups', methods: ['GET'])]
    public function listGroups(): JsonResponse
    {
        $groups = $this->groupRepository->findAllWithPermissions();

        $data = json_decode(
            $this->serializer->serialize($groups, 'json', ['groups' => ['permission_group:read', 'permission:read']]),
            true,
        );

        return $this->json($data);
    }

    /**
     * Cree un groupe de permissions.
     */
    #[Route('/api/admin/permission-groups', name: 'api_admin_permission_groups_create', methods: ['POST'])]
    public function createGroup(Request $request): JsonResponse
    {
        /** @var array{name?: string, description?: string, permissions?: list<string>} $data */
        $data = json_decode($request->getContent(), true);

        $group = new PermissionGroup();
        $group->setName($data['name'] ?? '');
        $group->setDescription($data['description'] ?? '');

        // Ajout des permissions par ID
        foreach ($data['permissions'] ?? [] as $permissionId) {
            $permission = $this->permissionRepository->find($permissionId);
            if ($permission instanceof Permission) {
                $group->addPermission($permission);
            }
        }

        $this->entityManager->persist($group);
        $this->entityManager->flush();

        return $this->json(
            ['id' => (string) $group->getId(), 'message' => 'Groupe cree.'],
            Response::HTTP_CREATED,
        );
    }

    /**
     * Met a jour un groupe de permissions.
     */
    #[Route('/api/admin/permission-groups/{id}', name: 'api_admin_permission_groups_update', methods: ['PUT'])]
    public function updateGroup(string $id, Request $request): JsonResponse
    {
        $group = $this->groupRepository->find($id);

        if (!$group instanceof PermissionGroup) {
            return $this->json(['error' => 'Groupe introuvable.'], Response::HTTP_NOT_FOUND);
        }

        /** @var array{name?: string, description?: string, permissions?: list<string>} $data */
        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $group->setName($data['name']);
        }
        if (isset($data['description'])) {
            $group->setDescription($data['description']);
        }

        // Remplacement des permissions si fournies
        if (isset($data['permissions'])) {
            // Suppression des anciennes
            foreach ($group->getPermissions()->toArray() as $perm) {
                $group->removePermission($perm);
            }
            // Ajout des nouvelles
            foreach ($data['permissions'] as $permissionId) {
                $permission = $this->permissionRepository->find($permissionId);
                if ($permission instanceof Permission) {
                    $group->addPermission($permission);
                }
            }
        }

        $this->entityManager->flush();

        return $this->json(['message' => 'Groupe mis a jour.']);
    }

    /**
     * Supprime un groupe de permissions.
     */
    #[Route('/api/admin/permission-groups/{id}', name: 'api_admin_permission_groups_delete', methods: ['DELETE'])]
    public function deleteGroup(string $id): JsonResponse
    {
        $group = $this->groupRepository->find($id);

        if (!$group instanceof PermissionGroup) {
            return $this->json(['error' => 'Groupe introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($group);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
