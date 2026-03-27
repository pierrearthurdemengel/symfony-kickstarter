<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * Voter generique pour les permissions RBAC.
 * Supporte les attributs de type chaine (ex: 'users.read', 'audit.read').
 *
 * @extends Voter<string, null>
 */
final class PermissionVoter extends Voter
{
    protected function supports(string $attribute, mixed $subject): bool
    {
        // Supporte tout attribut contenant un point (convention permission RBAC)
        return str_contains($attribute, '.');
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        // Les ROLE_ADMIN ont toutes les permissions
        if (\in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return true;
        }

        return $user->hasPermission($attribute);
    }
}
