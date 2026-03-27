<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AuthenticationTest extends WebTestCase
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
     * Creation d'un utilisateur de test dans la base.
     */
    private function createTestUser(string $email = 'auth@test.dev', string $password = 'password'): User
    {
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($hasher->hashPassword($user, $password));
        $user->setFirstName('Test');
        $user->setLastName('Auth');

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }

    public function testLoginWithValidCredentials(): void
    {
        $this->createTestUser();

        $this->client->request('POST', '/api/login', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'email' => 'auth@test.dev',
            'password' => 'password',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('token', $response);
        self::assertNotEmpty($response['token']);
    }

    public function testLoginWithInvalidCredentials(): void
    {
        $this->createTestUser('auth-bad@test.dev');

        $this->client->request('POST', '/api/login', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'email' => 'auth-bad@test.dev',
            'password' => 'wrong_password',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testRegisterNewUser(): void
    {
        $this->client->request('POST', '/api/register', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'email' => 'newuser@test.dev',
            'password' => 'securepassword',
            'firstName' => 'Nouveau',
            'lastName' => 'Utilisateur',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertSame('newuser@test.dev', $response['email']);
        self::assertArrayNotHasKey('password', $response);
    }

    public function testAccessProtectedEndpointWithoutJwt(): void
    {
        $this->client->request('GET', '/api/users');

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testAccessProtectedEndpointWithJwt(): void
    {
        $this->createTestUser('jwt@test.dev', 'password');

        // Obtention du token
        $this->client->request('POST', '/api/login', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'email' => 'jwt@test.dev',
            'password' => 'password',
        ]));

        $loginResponse = json_decode((string) $this->client->getResponse()->getContent(), true);
        $token = $loginResponse['token'] ?? '';

        // Acces a un endpoint protege
        $this->client->request('GET', '/api/users', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
            'HTTP_ACCEPT' => 'application/ld+json',
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testHealthcheckIsPublic(): void
    {
        $this->client->request('GET', '/api/healthcheck');

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertSame('ok', $response['status']);
        self::assertArrayHasKey('timestamp', $response);
        self::assertArrayHasKey('version', $response);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        unset($this->entityManager);
    }
}
