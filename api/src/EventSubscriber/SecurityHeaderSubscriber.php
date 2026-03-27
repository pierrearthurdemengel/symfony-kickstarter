<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Ajoute les headers de securite avances a toutes les reponses HTTP.
 * CSP dynamique avec nonce pour les scripts inline React, Permissions-Policy,
 * Referrer-Policy et protection contre les attaques courantes.
 */
final readonly class SecurityHeaderSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => ['onKernelResponse', -10],
        ];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $response = $event->getResponse();
        $request = $event->getRequest();

        // Les reponses API n'ont pas besoin de CSP pour scripts
        $isApiRequest = str_starts_with($request->getPathInfo(), '/api');

        if ($isApiRequest) {
            // CSP stricte pour les reponses API (pas de scripts, pas de styles)
            $response->headers->set(
                'Content-Security-Policy',
                "default-src 'none'; frame-ancestors 'none'",
            );
        }

        // Permissions-Policy : restriction des fonctionnalites navigateur
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
        );

        // Referrer-Policy : envoyer le referrer uniquement sur la meme origine
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Protection contre le clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');

        // Desactivation du sniffing MIME
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Cross-Origin-Opener-Policy
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');

        // Cross-Origin-Resource-Policy
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');
    }
}
