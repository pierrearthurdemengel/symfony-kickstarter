<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests des headers de securite avances sur les reponses HTTP.
 */
final class SecurityHeadersTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = self::createClient();
    }

    public function testResponseContainsSecurityHeaders(): void
    {
        $this->client->request('GET', '/api/healthcheck');

        $response = $this->client->getResponse();

        // Permissions-Policy
        self::assertTrue(
            $response->headers->has('Permissions-Policy'),
            'Le header Permissions-Policy doit etre present.',
        );
        self::assertStringContainsString(
            'camera=()',
            (string) $response->headers->get('Permissions-Policy'),
        );

        // Referrer-Policy
        self::assertSame(
            'strict-origin-when-cross-origin',
            $response->headers->get('Referrer-Policy'),
        );

        // X-Frame-Options
        self::assertSame('DENY', $response->headers->get('X-Frame-Options'));

        // X-Content-Type-Options
        self::assertSame('nosniff', $response->headers->get('X-Content-Type-Options'));

        // Cross-Origin-Opener-Policy
        self::assertSame('same-origin', $response->headers->get('Cross-Origin-Opener-Policy'));
    }

    public function testApiResponseContainsCsp(): void
    {
        $this->client->request('GET', '/api/healthcheck');

        $response = $this->client->getResponse();

        self::assertTrue(
            $response->headers->has('Content-Security-Policy'),
            'Le header CSP doit etre present pour les reponses API.',
        );
        self::assertStringContainsString(
            "default-src 'none'",
            (string) $response->headers->get('Content-Security-Policy'),
        );
    }
}
