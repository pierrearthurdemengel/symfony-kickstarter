<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Tests des endpoints d'administration.
 */
final class AdminControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = self::createClient();

        /** @var EntityManagerInterface $em */
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $this->entityManager = $em;
    }

    /**
     * Creation d'un utilisateur et retour du token JWT.
     *
     * @param list<string> $roles
     */
    private function createUserAndGetToken(
        string $email,
        array $roles = ['ROLE_USER'],
    ): string {
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setRoles($roles);
        $user->setPassword($hasher->hashPassword($user, 'password'));
        $user->setFirstName('Test');
        $user->setLastName('Admin');

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $this->client->request('POST', '/api/login', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'email' => $email,
            'password' => 'password',
        ]));

        /** @var array{token: string} $response */
        $response = json_decode((string) $this->client->getResponse()->getContent(), true);

        return $response['token'];
    }

    public function testStatsRequiresAdmin(): void
    {
        $token = $this->createUserAndGetToken('user-stats@test.dev');

        $this->client->request('GET', '/api/admin/stats', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testStatsAsAdmin(): void
    {
        $token = $this->createUserAndGetToken('admin-stats@test.dev', ['ROLE_ADMIN']);

        $this->client->request('GET', '/api/admin/stats', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('totalUsers', $response);
        self::assertArrayHasKey('verifiedUsers', $response);
        self::assertArrayHasKey('verificationRate', $response);
        self::assertArrayHasKey('registrationsByMonth', $response);
        self::assertArrayHasKey('roleDistribution', $response);
    }

    public function testExportCsvRequiresAdmin(): void
    {
        $token = $this->createUserAndGetToken('user-export@test.dev');

        $this->client->request('GET', '/api/admin/users/export', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testExportCsvAsAdmin(): void
    {
        $token = $this->createUserAndGetToken('admin-export@test.dev', ['ROLE_ADMIN']);

        $this->client->request('GET', '/api/admin/users/export', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        self::assertStringContainsString('text/csv', (string) $this->client->getResponse()->headers->get('Content-Type'));
        self::assertStringContainsString('attachment', (string) $this->client->getResponse()->headers->get('Content-Disposition'));
    }

    public function testAuditLogsRequiresAdmin(): void
    {
        $token = $this->createUserAndGetToken('user-audit@test.dev');

        $this->client->request('GET', '/api/admin/audit-logs', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testAuditLogsAsAdmin(): void
    {
        $token = $this->createUserAndGetToken('admin-audit@test.dev', ['ROLE_ADMIN']);

        $this->client->request('GET', '/api/admin/audit-logs', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('items', $response);
        self::assertArrayHasKey('total', $response);
        self::assertArrayHasKey('page', $response);
        self::assertArrayHasKey('totalPages', $response);
    }

    public function testAdminEndpointsUnauthenticated(): void
    {
        $this->client->request('GET', '/api/admin/stats');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        unset($this->entityManager);
    }
}
