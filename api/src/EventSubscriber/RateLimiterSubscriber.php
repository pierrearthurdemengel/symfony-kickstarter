<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\RateLimiterFactory;

final readonly class RateLimiterSubscriber implements EventSubscriberInterface
{
    /** @var array<string, string> Correspondance route -> limiter */
    private const array ROUTE_LIMITERS = [
        'api_login' => 'login',
        'api_register' => 'register',
        'api_forgot_password' => 'forgot_password',
    ];

    public function __construct(
        private RateLimiterFactory $loginLimiter,
        private RateLimiterFactory $registerLimiter,
        private RateLimiterFactory $forgotPasswordLimiter,
        private RateLimiterFactory $apiLimiter,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 20],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $route = $request->attributes->getString('_route', '');
        $clientIp = $request->getClientIp() ?? '0.0.0.0';

        // Limiter specifique par route
        $limiterKey = self::ROUTE_LIMITERS[$route] ?? null;
        if ($limiterKey !== null) {
            $factory = $this->getSpecificLimiter($limiterKey);
            if ($factory !== null) {
                $limit = $factory->create($clientIp)->consume();
                if (!$limit->isAccepted()) {
                    $event->setResponse($this->createRateLimitResponse($limit));

                    return;
                }

                $this->addRateLimitHeaders($event, $limit);
            }
        }

        // Limiter global API
        if (str_starts_with($request->getPathInfo(), '/api')) {
            $limit = $this->apiLimiter->create($clientIp)->consume();
            if (!$limit->isAccepted()) {
                $event->setResponse($this->createRateLimitResponse($limit));

                return;
            }

            $this->addRateLimitHeaders($event, $limit);
        }
    }

    private function getSpecificLimiter(string $key): ?RateLimiterFactory
    {
        return match ($key) {
            'login' => $this->loginLimiter,
            'register' => $this->registerLimiter,
            'forgot_password' => $this->forgotPasswordLimiter,
            default => null,
        };
    }

    private function createRateLimitResponse(\Symfony\Component\RateLimiter\RateLimit $limit): JsonResponse
    {
        $retryAfter = $limit->getRetryAfter();

        $response = new JsonResponse(
            ['error' => 'Trop de requetes. Veuillez reessayer plus tard.'],
            Response::HTTP_TOO_MANY_REQUESTS,
        );

        $response->headers->set('X-RateLimit-Limit', (string) $limit->getLimit());
        $response->headers->set('X-RateLimit-Remaining', '0');
        $response->headers->set('X-RateLimit-Reset', (string) $retryAfter->getTimestamp());
        $response->headers->set('Retry-After', (string) $retryAfter->getTimestamp());

        return $response;
    }

    private function addRateLimitHeaders(RequestEvent $event, \Symfony\Component\RateLimiter\RateLimit $limit): void
    {
        $event->getRequest()->attributes->set('_rate_limit', [
            'limit' => $limit->getLimit(),
            'remaining' => $limit->getRemainingTokens(),
            'reset' => $limit->getRetryAfter()->getTimestamp(),
        ]);
    }
}
