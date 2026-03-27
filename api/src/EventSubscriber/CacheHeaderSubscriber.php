<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Ajoute des headers de cache HTTP sur les reponses GET publiques.
 * Les endpoints authentifies recoivent un header private.
 */
final class CacheHeaderSubscriber implements EventSubscriberInterface
{
    /** @var array<string, int> Routes publiques avec leur duree de cache en secondes */
    private const PUBLIC_CACHE_ROUTES = [
        'api_healthcheck' => 60,
        'api_search' => 30,
    ];

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => 'onKernelResponse',
        ];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $response = $event->getResponse();

        // Uniquement les GET
        if ('GET' !== $request->getMethod()) {
            return;
        }

        $route = $request->attributes->get('_route', '');

        // Routes avec cache public
        if (\is_string($route) && isset(self::PUBLIC_CACHE_ROUTES[$route])) {
            $maxAge = self::PUBLIC_CACHE_ROUTES[$route];
            $response->setPublic();
            $response->setMaxAge($maxAge);
            $response->setSharedMaxAge($maxAge);

            return;
        }

        // Reponses authentifiees : cache prive avec revalidation
        if ($request->headers->has('Authorization')) {
            $response->setPrivate();
            $response->headers->set('Cache-Control', 'private, no-cache, must-revalidate');
        }
    }
}
