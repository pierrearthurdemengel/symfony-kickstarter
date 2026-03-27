<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\RefreshToken;
use App\Entity\User;
use App\Repository\RefreshTokenRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Gestion du cycle de vie des refresh tokens : creation, rotation, revocation.
 */
final readonly class RefreshTokenService
{
    /** Duree de vie par defaut du refresh token : 30 jours */
    private const int DEFAULT_TTL = 30 * 24 * 3600;

    /** Nombre maximum de sessions actives par utilisateur */
    private const int MAX_ACTIVE_TOKENS = 5;

    public function __construct(
        private EntityManagerInterface $entityManager,
        private RefreshTokenRepository $refreshTokenRepository,
        private RequestStack $requestStack,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * Cree un nouveau refresh token pour l'utilisateur.
     */
    public function create(User $user): RefreshToken
    {
        // Limitation du nombre de sessions actives
        $activeCount = $this->refreshTokenRepository->countActiveTokensForUser($user);
        if ($activeCount >= self::MAX_ACTIVE_TOKENS) {
            $this->refreshTokenRepository->revokeAllForUser($user);
            $this->logger->warning('Nombre maximum de sessions atteint, tous les tokens revoques.', [
                'userId' => (string) $user->getId(),
            ]);
        }

        $refreshToken = new RefreshToken();
        $refreshToken->setUser($user);
        $refreshToken->setToken(bin2hex(random_bytes(64)));
        $refreshToken->setExpiresAt(new DateTimeImmutable(sprintf('+%d seconds', self::DEFAULT_TTL)));

        $request = $this->requestStack->getCurrentRequest();
        if (null !== $request) {
            $refreshToken->setIpAddress($request->getClientIp());
            $userAgent = $request->headers->get('User-Agent');
            if (null !== $userAgent) {
                $refreshToken->setUserAgent(substr($userAgent, 0, 512));
            }
        }

        $this->entityManager->persist($refreshToken);
        $this->entityManager->flush();

        return $refreshToken;
    }

    /**
     * Rotation du refresh token : revoque l'ancien et cree un nouveau.
     * Retourne null si le token fourni est invalide.
     */
    public function rotate(string $token): ?RefreshToken
    {
        $currentToken = $this->refreshTokenRepository->findValidToken($token);

        if (null === $currentToken) {
            $this->logger->warning('Tentative de rotation avec un token invalide.');

            return null;
        }

        $user = $currentToken->getUser();
        if (null === $user) {
            return null;
        }

        // Revocation de l'ancien token
        $currentToken->setIsRevoked(true);
        $this->entityManager->flush();

        // Creation d'un nouveau token
        return $this->create($user);
    }

    /**
     * Revoque tous les refresh tokens d'un utilisateur (deconnexion globale).
     */
    public function revokeAllForUser(User $user): void
    {
        $count = $this->refreshTokenRepository->revokeAllForUser($user);

        $this->logger->info('Refresh tokens revoques.', [
            'userId' => (string) $user->getId(),
            'count' => $count,
        ]);
    }

    /**
     * Valide un refresh token et retourne l'utilisateur associe.
     */
    public function validate(string $token): ?User
    {
        $refreshToken = $this->refreshTokenRepository->findValidToken($token);

        if (null === $refreshToken) {
            return null;
        }

        return $refreshToken->getUser();
    }
}
