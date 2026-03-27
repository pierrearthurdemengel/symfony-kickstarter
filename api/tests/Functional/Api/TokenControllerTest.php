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
 * Tests du TokenController : refresh token, logout, blacklist.
 */
final class TokenControllerTest extends WebTestCase
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
     * Creation d'un utilisateur et obtention du token JWT + refresh token.
     *
     * @return array{token: string, refresh_token: string}
     */
    private function createUserAndLogin(string $email = 'token@test.dev'): array
    {
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($hasher->hashPassword($user, 'password'));
        $user->setFirstName('Token');
        $user->setLastName('Test');

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $this->client->request('POST', '/api/login', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'email' => $email,
            'password' => 'password',
        ]));

        /** @var array{token: string, refresh_token: string} $response */
        $response = json_decode((string) $this->client->getResponse()->getContent(), true);

        return $response;
    }

    public function testLoginReturnsRefreshToken(): void
    {
        $response = $this->createUserAndLogin('refresh-login@test.dev');

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        self::assertArrayHasKey('token', $response);
        self::assertArrayHasKey('refresh_token', $response);
        self::assertNotEmpty($response['refresh_token']);
    }

    public function testRefreshTokenReturnsNewTokens(): void
    {
        $loginResponse = $this->createUserAndLogin('refresh-new@test.dev');

        $this->client->request('POST', '/api/token/refresh', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'refresh_token' => $loginResponse['refresh_token'],
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        /** @var array{token: string, refresh_token: string} $refreshResponse */
        $refreshResponse = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('token', $refreshResponse);
        self::assertArrayHasKey('refresh_token', $refreshResponse);
        self::assertNotSame($loginResponse['refresh_token'], $refreshResponse['refresh_token']);
    }

    public function testRefreshTokenRotation(): void
    {
        $loginResponse = $this->createUserAndLogin('refresh-rotate@test.dev');

        // Premier rafraichissement
        $this->client->request('POST', '/api/token/refresh', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'refresh_token' => $loginResponse['refresh_token'],
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        // L'ancien token doit etre revoque
        $this->client->request('POST', '/api/token/refresh', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'refresh_token' => $loginResponse['refresh_token'],
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testRefreshWithInvalidToken(): void
    {
        $this->client->request('POST', '/api/token/refresh', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'refresh_token' => 'invalid_token_value',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testRefreshWithoutToken(): void
    {
        $this->client->request('POST', '/api/token/refresh', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([]));

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testLogoutRevokesTokens(): void
    {
        $loginResponse = $this->createUserAndLogin('logout@test.dev');

        // Deconnexion
        $this->client->request('POST', '/api/logout', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $loginResponse['token'],
        ], (string) json_encode([
            'refresh_token' => $loginResponse['refresh_token'],
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        // Le refresh token doit etre revoque
        $this->client->request('POST', '/api/token/refresh', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'refresh_token' => $loginResponse['refresh_token'],
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        unset($this->entityManager);
    }
}
