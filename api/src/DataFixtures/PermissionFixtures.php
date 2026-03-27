<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Permission;
use App\Entity\PermissionGroup;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/**
 * Fixtures pour les permissions et groupes de permissions par defaut.
 */
final class PermissionFixtures extends Fixture
{
    /** @var array<string, list<array{name: string, description: string}>> */
    private const PERMISSIONS = [
        'users' => [
            ['name' => 'users.read', 'description' => 'Voir la liste des utilisateurs'],
            ['name' => 'users.create', 'description' => 'Creer un utilisateur'],
            ['name' => 'users.update', 'description' => 'Modifier un utilisateur'],
            ['name' => 'users.delete', 'description' => 'Supprimer un utilisateur'],
        ],
        'notifications' => [
            ['name' => 'notifications.read', 'description' => 'Voir les notifications'],
            ['name' => 'notifications.create', 'description' => 'Creer une notification'],
            ['name' => 'notifications.delete', 'description' => 'Supprimer une notification'],
        ],
        'media' => [
            ['name' => 'media.upload', 'description' => 'Telecharger des fichiers'],
            ['name' => 'media.delete', 'description' => 'Supprimer des fichiers'],
        ],
        'audit' => [
            ['name' => 'audit.read', 'description' => 'Consulter le journal d\'audit'],
        ],
        'permissions' => [
            ['name' => 'permissions.read', 'description' => 'Voir les permissions et groupes'],
            ['name' => 'permissions.manage', 'description' => 'Gerer les groupes de permissions'],
        ],
        'settings' => [
            ['name' => 'settings.read', 'description' => 'Voir les parametres'],
            ['name' => 'settings.update', 'description' => 'Modifier les parametres'],
        ],
    ];

    public function load(ObjectManager $manager): void
    {
        $allPermissions = [];

        // Creation des permissions
        foreach (self::PERMISSIONS as $category => $perms) {
            foreach ($perms as $permData) {
                $permission = new Permission();
                $permission->setName($permData['name']);
                $permission->setDescription($permData['description']);
                $permission->setCategory($category);
                $manager->persist($permission);
                $allPermissions[$permData['name']] = $permission;
            }
        }

        // Groupe "Moderateur" : lecture utilisateurs + notifications
        $moderator = new PermissionGroup();
        $moderator->setName('Moderateur');
        $moderator->setDescription('Acces en lecture aux utilisateurs et notifications');
        $moderator->addPermission($allPermissions['users.read']);
        $moderator->addPermission($allPermissions['notifications.read']);
        $moderator->addPermission($allPermissions['notifications.create']);
        $moderator->addPermission($allPermissions['audit.read']);
        $manager->persist($moderator);

        // Groupe "Editeur" : gestion du contenu et des medias
        $editor = new PermissionGroup();
        $editor->setName('Editeur');
        $editor->setDescription('Gestion du contenu et des fichiers medias');
        $editor->addPermission($allPermissions['users.read']);
        $editor->addPermission($allPermissions['notifications.read']);
        $editor->addPermission($allPermissions['notifications.create']);
        $editor->addPermission($allPermissions['notifications.delete']);
        $editor->addPermission($allPermissions['media.upload']);
        $editor->addPermission($allPermissions['media.delete']);
        $manager->persist($editor);

        // Groupe "Gestionnaire" : toutes les permissions sauf audit et parametres
        $gestionnaire = new PermissionGroup();
        $gestionnaire->setName('Gestionnaire');
        $gestionnaire->setDescription('Gestion complete des utilisateurs, notifications et medias');
        $gestionnaire->addPermission($allPermissions['users.read']);
        $gestionnaire->addPermission($allPermissions['users.create']);
        $gestionnaire->addPermission($allPermissions['users.update']);
        $gestionnaire->addPermission($allPermissions['users.delete']);
        $gestionnaire->addPermission($allPermissions['notifications.read']);
        $gestionnaire->addPermission($allPermissions['notifications.create']);
        $gestionnaire->addPermission($allPermissions['notifications.delete']);
        $gestionnaire->addPermission($allPermissions['media.upload']);
        $gestionnaire->addPermission($allPermissions['media.delete']);
        $gestionnaire->addPermission($allPermissions['audit.read']);
        $manager->persist($gestionnaire);

        $manager->flush();
    }
}
