<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class UserTest extends WebTestCase
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
        string $password = 'password',
        array $roles = ['ROLE_USER'],
    ): string {
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setRoles($roles);
        $user->setPassword($hasher->hashPassword($user, $password));
        $user->setFirstName('Test');
        $user->setLastName('User');

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $this->client->request('POST', '/api/login', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], (string) json_encode([
            'email' => $email,
            'password' => $password,
        ]));

        /** @var array{token: string} $response */
        $response = json_decode((string) $this->client->getResponse()->getContent(), true);

        return $response['token'];
    }

    /**
     * Recherche de l'id d'un utilisateur par email.
     */
    private function getUserIdByEmail(string $email): string
    {
        /** @var User|null $user */
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        return (string) $user?->getId();
    }

    public function testGetCollectionAuthenticated(): void
    {
        $token = $this->createUserAndGetToken('list@test.dev');

        $this->client->request('GET', '/api/users', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
            'HTTP_ACCEPT' => 'application/ld+json',
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testGetSingleUserAuthenticated(): void
    {
        $token = $this->createUserAndGetToken('single@test.dev');
        $userId = $this->getUserIdByEmail('single@test.dev');

        $this->client->request('GET', '/api/users/'.$userId, [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
            'HTTP_ACCEPT' => 'application/ld+json',
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testPostUserAsAdmin(): void
    {
        $token = $this->createUserAndGetToken('admin@test.dev', 'password', ['ROLE_ADMIN']);

        $this->client->request('POST', '/api/users', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
            'CONTENT_TYPE' => 'application/ld+json',
            'HTTP_ACCEPT' => 'application/ld+json',
        ], (string) json_encode([
            'email' => 'created@test.dev',
            'plainPassword' => 'securepassword',
            'firstName' => 'Cree',
            'lastName' => 'Parladmin',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
    }

    public function testPatchUserAsOwner(): void
    {
        $token = $this->createUserAndGetToken('owner@test.dev');
        $userId = $this->getUserIdByEmail('owner@test.dev');

        $this->client->request('PATCH', '/api/users/'.$userId, [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
            'CONTENT_TYPE' => 'application/merge-patch+json',
            'HTTP_ACCEPT' => 'application/ld+json',
        ], (string) json_encode([
            'firstName' => 'Modifie',
            'lastName' => 'ParLui',
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testDeleteUserAsAdmin(): void
    {
        $token = $this->createUserAndGetToken('deleteadmin@test.dev', 'password', ['ROLE_ADMIN']);

        // Creation d'un utilisateur a supprimer
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);

        $userToDelete = new User();
        $userToDelete->setEmail('todelete@test.dev');
        $userToDelete->setRoles(['ROLE_USER']);
        $userToDelete->setPassword($hasher->hashPassword($userToDelete, 'password'));
        $userToDelete->setFirstName('A');
        $userToDelete->setLastName('Supprimer');

        $this->entityManager->persist($userToDelete);
        $this->entityManager->flush();

        $deleteUserId = (string) $userToDelete->getId();

        $this->client->request('DELETE', '/api/users/'.$deleteUserId, [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
            'HTTP_ACCEPT' => 'application/ld+json',
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
    }

    public function testGetCollectionUnauthenticated(): void
    {
        $this->client->request('GET', '/api/users');

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        unset($this->entityManager);
    }
}
