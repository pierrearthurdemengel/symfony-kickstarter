<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Service de dispatch de webhooks.
 * Envoie des evenements HTTP a des URLs configurees.
 */
final readonly class WebhookService
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * Envoie un webhook a une URL donnee.
     *
     * @param array<string, mixed> $payload
     */
    public function dispatch(string $url, string $event, array $payload, ?string $secret = null): bool
    {
        try {
            $body = [
                'event' => $event,
                'timestamp' => (new \DateTimeImmutable())->format('c'),
                'data' => $payload,
            ];

            $headers = [
                'Content-Type' => 'application/json',
                'X-Webhook-Event' => $event,
            ];

            // Signature HMAC-SHA256 si un secret est fourni
            if (null !== $secret) {
                $signature = hash_hmac('sha256', (string) json_encode($body, JSON_THROW_ON_ERROR), $secret);
                $headers['X-Webhook-Signature'] = $signature;
            }

            $response = $this->httpClient->request('POST', $url, [
                'headers' => $headers,
                'json' => $body,
                'timeout' => 10,
            ]);

            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 300) {
                return true;
            }

            $this->logger->warning('Webhook {event} vers {url} : code HTTP {code}', [
                'event' => $event,
                'url' => $url,
                'code' => $statusCode,
            ]);

            return false;
        } catch (\Throwable $e) {
            $this->logger->error('Echec webhook {event} vers {url} : {message}', [
                'event' => $event,
                'url' => $url,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Envoie un webhook a plusieurs URLs.
     *
     * @param list<array{url: string, secret?: string}> $endpoints
     * @param array<string, mixed> $payload
     */
    public function dispatchToMany(array $endpoints, string $event, array $payload): void
    {
        foreach ($endpoints as $endpoint) {
            $this->dispatch(
                $endpoint['url'],
                $event,
                $payload,
                $endpoint['secret'] ?? null,
            );
        }
    }
}
