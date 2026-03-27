<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Entity\ResetPasswordToken;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class ResetPasswordTest extends WebTestCase
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
    private function createTestUser(string $email = 'reset@test.dev', string $password = 'password'): User
    {
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($hasher->hashPassword($user, $password));
        $user->setFirstName('Test');
        $user->setLastName('Reset');

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }

    /**
     * Creation d'un token de reset pour un utilisateur.
     */
    private function createResetToken(User $user, bool $expired = false): ResetPasswordToken
    {
        $token = new ResetPasswordToken();
        $token->setUser($user);
        $token->setToken(bin2hex(random_bytes(32)));

        if ($expired) {
            $token->setExpiresAt(new DateTimeImmutable('-1 hour'));
        } else {
            $token->setExpiresAt(new DateTimeImmutable('+1 hour'));
        }

        $this->entityManager->persist($token);
        $this->entityManager->flush();

        return $token;
    }

    public function testForgotPasswordReturns200(): void
    {
        $this->createTestUser();

        $this->client->request('POST', '/api/forgot-password', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'email' => 'reset@test.dev',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testForgotPasswordReturns200ForUnknownEmail(): void
    {
        $this->client->request('POST', '/api/forgot-password', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'email' => 'unknown@test.dev',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testResetPasswordWithValidToken(): void
    {
        $user = $this->createTestUser('resetvalid@test.dev');
        $resetToken = $this->createResetToken($user);

        $this->client->request('POST', '/api/reset-password', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'token' => $resetToken->getToken(),
            'password' => 'newpassword123',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertSame('Mot de passe reinitialise avec succes.', $response['message']);
    }

    public function testResetPasswordWithExpiredToken(): void
    {
        $user = $this->createTestUser('resetexpired@test.dev');
        $resetToken = $this->createResetToken($user, expired: true);

        $this->client->request('POST', '/api/reset-password', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'token' => $resetToken->getToken(),
            'password' => 'newpassword123',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testResetPasswordWithInvalidToken(): void
    {
        $this->client->request('POST', '/api/reset-password', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'token' => 'invalid_token_value',
            'password' => 'newpassword123',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testResetPasswordWithMissingFields(): void
    {
        $this->client->request('POST', '/api/reset-password', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'token' => '',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        unset($this->entityManager);
    }
}
