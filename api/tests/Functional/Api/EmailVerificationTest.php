<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Entity\EmailVerificationToken;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Uid\Uuid;

final class EmailVerificationTest extends WebTestCase
{
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        parent::setUp();
        self::bootKernel();

        /** @var EntityManagerInterface $em */
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $this->entityManager = $em;
    }

    /**
     * Creation d'un utilisateur de test.
     */
    private function createTestUser(string $email = 'verify@test.dev', string $password = 'password'): User
    {
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($hasher->hashPassword($user, $password));
        $user->setFirstName('Test');
        $user->setLastName('Verify');

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }

    /**
     * Obtention du token JWT.
     */
    private function getJwtToken(string $email = 'verify@test.dev', string $password = 'password'): string
    {
        $client = self::createClient();
        $client->request('POST', '/api/login', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'email' => $email,
            'password' => $password,
        ]));

        /** @var array{token: string} $response */
        $response = json_decode((string) $client->getResponse()->getContent(), true);

        return $response['token'];
    }

    /**
     * Creation d'un token de verification.
     */
    private function createVerificationToken(User $user, string $tokenValue = null, bool $expired = false): EmailVerificationToken
    {
        $token = new EmailVerificationToken();
        $token->setUser($user);
        $token->setToken($tokenValue ?? Uuid::v7()->toRfc4122());

        if ($expired) {
            $token->setExpiresAt(new \DateTimeImmutable('-1 hour'));
        }

        $this->entityManager->persist($token);
        $this->entityManager->flush();

        return $token;
    }

    public function testVerifyEmailWithValidToken(): void
    {
        $user = $this->createTestUser();
        $tokenValue = Uuid::v7()->toRfc4122();
        $this->createVerificationToken($user, $tokenValue);

        $client = self::createClient();
        $client->request('GET', '/api/verify-email?token=' . $tokenValue);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        /** @var array{message: string} $response */
        $response = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertSame('Email verifie avec succes.', $response['message']);
    }

    public function testVerifyEmailWithInvalidToken(): void
    {
        $client = self::createClient();
        $client->request('GET', '/api/verify-email?token=invalid-token-value');

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);

        /** @var array{error: string} $response */
        $response = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertArrayHasKey('error', $response);
    }

    public function testResendVerificationAuthenticated(): void
    {
        $user = $this->createTestUser('resend@test.dev');
        $token = $this->getJwtToken('resend@test.dev');

        $client = self::createClient();
        $client->request('POST', '/api/resend-verification', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            'CONTENT_TYPE' => 'application/json',
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        /** @var array{message: string} $response */
        $response = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertArrayHasKey('message', $response);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        unset($this->entityManager);
    }
}
