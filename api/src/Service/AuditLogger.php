<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\AuditLog;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Service de journalisation des actions administratives.
 */
final readonly class AuditLogger
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security $security,
        private RequestStack $requestStack,
    ) {
    }

    /**
     * Enregistre une action dans le journal d'audit.
     *
     * @param array<string, mixed> $changes Donnees modifiees
     */
    public function log(
        string $action,
        string $entityType,
        ?string $entityId = null,
        array $changes = [],
    ): void {
        $log = new AuditLog();
        $log->setAction($action);
        $log->setEntityType($entityType);
        $log->setEntityId($entityId);
        $log->setChanges($changes);

        $user = $this->security->getUser();
        if ($user !== null) {
            $log->setPerformedBy($user->getUserIdentifier());
        }

        $request = $this->requestStack->getCurrentRequest();
        if ($request !== null) {
            $log->setIpAddress($request->getClientIp());
        }

        $this->entityManager->persist($log);
        $this->entityManager->flush();
    }
}
