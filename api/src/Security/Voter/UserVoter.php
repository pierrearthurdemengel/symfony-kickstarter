<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * Voter pour les permissions sur l'entite User.
 *
 * @extends Voter<string, User>
 */
final class UserVoter extends Voter
{
    public const string USER_VIEW = 'USER_VIEW';
    public const string USER_EDIT = 'USER_EDIT';
    public const string USER_DELETE = 'USER_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return \in_array($attribute, [self::USER_VIEW, self::USER_EDIT, self::USER_DELETE], true)
            && $subject instanceof User;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $currentUser = $token->getUser();

        if (!$currentUser instanceof User) {
            return false;
        }

        /** @var User $targetUser */
        $targetUser = $subject;

        return match ($attribute) {
            self::USER_VIEW => true,
            self::USER_EDIT => $this->canModify($currentUser, $targetUser),
            self::USER_DELETE => $this->canModify($currentUser, $targetUser),
            default => false,
        };
    }

    /**
     * Seul le proprietaire ou un administrateur peut modifier/supprimer.
     */
    private function canModify(User $currentUser, User $targetUser): bool
    {
        if (\in_array('ROLE_ADMIN', $currentUser->getRoles(), true)) {
            return true;
        }

        $currentId = $currentUser->getId();
        $targetId = $targetUser->getId();

        if (null === $currentId || null === $targetId) {
            return false;
        }

        return $currentId->equals($targetId);
    }
}
