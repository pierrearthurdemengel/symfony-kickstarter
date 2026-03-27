<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\User;
use App\Service\RefreshTokenService;
use App\Service\TokenBlacklistService;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTDecodedEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Subscriber pour :
 * - Emettre un refresh token a la connexion
 * - Option cookie httpOnly pour l'access token
 * - Verification de la blacklist a chaque requete authentifiee
 */
final readonly class JWTSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private RefreshTokenService $refreshTokenService,
        private TokenBlacklistService $blacklistService,
        private RequestStack $requestStack,
        private ParameterBagInterface $params,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            Events::AUTHENTICATION_SUCCESS => 'onAuthenticationSuccess',
            Events::JWT_DECODED => 'onJWTDecoded',
        ];
    }

    /**
     * Ajoute le refresh token a la reponse d'authentification reussie.
     * Si le mode cookie httpOnly est active, stocke le JWT dans un cookie securise.
     */
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();
        if (!$user instanceof User) {
            return;
        }

        // Generation du refresh token
        $refreshToken = $this->refreshTokenService->create($user);
        $data = $event->getData();
        $data['refresh_token'] = $refreshToken->getToken();
        $event->setData($data);

        // Option cookie httpOnly pour le JWT
        if ($this->params->get('app.jwt_cookie_enabled')) {
            $response = $event->getResponse();
            $request = $this->requestStack->getCurrentRequest();
            $isSecure = null !== $request && $request->isSecure();

            $response->headers->setCookie(
                Cookie::create('BEARER')
                    ->withValue($data['token'] ?? '')
                    ->withHttpOnly(true)
                    ->withSecure($isSecure)
                    ->withSameSite('lax')
                    ->withPath('/')
                    ->withExpires(time() + 3600),
            );
        }
    }

    /**
     * Verifie que le token decode n'est pas blackliste.
     */
    public function onJWTDecoded(JWTDecodedEvent $event): void
    {
        $request = $this->requestStack->getCurrentRequest();
        if (null === $request) {
            return;
        }

        // Extraction du token brut pour calcul du hash
        $authHeader = $request->headers->get('Authorization', '');
        $jwt = '';

        if (str_starts_with($authHeader, 'Bearer ')) {
            $jwt = substr($authHeader, 7);
        }

        // Fallback sur le cookie httpOnly
        if ('' === $jwt && $this->params->get('app.jwt_cookie_enabled')) {
            $jwt = (string) $request->cookies->get('BEARER', '');
        }

        if ('' === $jwt) {
            return;
        }

        $identifier = hash('sha256', $jwt);
        if ($this->blacklistService->isBlacklisted($identifier)) {
            $event->markAsInvalid();
        }
    }
}
