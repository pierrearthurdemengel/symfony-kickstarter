<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Service\RefreshTokenService;
use App\Service\TokenBlacklistService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Gestion des tokens : rafraichissement JWT, deconnexion avec revocation.
 */
final class TokenController extends AbstractController
{
    public function __construct(
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly RefreshTokenService $refreshTokenService,
        private readonly TokenBlacklistService $blacklistService,
    ) {
    }

    /**
     * Echange un refresh token valide contre un nouveau couple access + refresh token.
     * Le refresh token utilise est revoque (rotation).
     */
    #[Route('/api/token/refresh', name: 'api_token_refresh', methods: ['POST'])]
    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = $this->extractRefreshToken($request);

        if (null === $refreshToken) {
            return $this->json(
                ['message' => 'Refresh token manquant.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $newRefreshToken = $this->refreshTokenService->rotate($refreshToken);

        if (null === $newRefreshToken) {
            return $this->json(
                ['message' => 'Refresh token invalide ou expire.'],
                Response::HTTP_UNAUTHORIZED,
            );
        }

        /** @var User $user */
        $user = $newRefreshToken->getUser();
        $accessToken = $this->jwtManager->create($user);

        $response = $this->json([
            'token' => $accessToken,
            'refresh_token' => $newRefreshToken->getToken(),
        ]);

        // Si le cookie httpOnly est active, on le met a jour
        if ($this->getParameter('app.jwt_cookie_enabled')) {
            $response->headers->setCookie(
                Cookie::create('BEARER')
                    ->withValue($accessToken)
                    ->withHttpOnly(true)
                    ->withSecure($request->isSecure())
                    ->withSameSite('lax')
                    ->withPath('/')
                    ->withExpires(time() + 3600),
            );
        }

        return $response;
    }

    /**
     * Deconnexion : revoque le refresh token et blackliste l'access token courant.
     */
    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        // Revocation du refresh token
        $refreshToken = $this->extractRefreshToken($request);
        if (null !== $refreshToken) {
            $validUser = $this->refreshTokenService->validate($refreshToken);
            if (null !== $validUser) {
                $this->refreshTokenService->revokeAllForUser($validUser);
            }
        } elseif (null !== $user) {
            $this->refreshTokenService->revokeAllForUser($user);
        }

        // Blacklist de l'access token courant (TTL = temps restant)
        $authHeader = $request->headers->get('Authorization', '');
        if (str_starts_with($authHeader, 'Bearer ')) {
            $jwt = substr($authHeader, 7);
            $this->blacklistAccessToken($jwt);
        }

        $response = $this->json(['message' => 'Deconnexion reussie.']);

        // Suppression du cookie httpOnly si actif
        if ($this->getParameter('app.jwt_cookie_enabled')) {
            $response->headers->clearCookie('BEARER', '/');
        }

        return $response;
    }

    /**
     * Extrait le refresh token depuis le corps JSON ou le cookie.
     */
    private function extractRefreshToken(Request $request): ?string
    {
        /** @var array{refresh_token?: string} $data */
        $data = json_decode($request->getContent(), true) ?? [];

        $token = $data['refresh_token'] ?? null;

        if (null === $token) {
            $token = $request->cookies->get('refresh_token');
        }

        return \is_string($token) && '' !== $token ? $token : null;
    }

    /**
     * Blackliste un access token JWT en calculant le TTL restant.
     */
    private function blacklistAccessToken(string $jwt): void
    {
        $parts = explode('.', $jwt);
        if (3 !== \count($parts)) {
            return;
        }

        $payload = json_decode(base64_decode($parts[1], true) ?: '', true);
        if (!\is_array($payload) || !isset($payload['exp'])) {
            return;
        }

        $ttl = (int) $payload['exp'] - time();
        if ($ttl <= 0) {
            return;
        }

        // Utilisation du hash SHA-256 comme identifiant du token
        $identifier = hash('sha256', $jwt);
        $this->blacklistService->blacklist($identifier, $ttl);
    }
}
