<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Tests des endpoints de notifications utilisateur.
 */
final class NotificationControllerTest extends WebTestCase
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
     * Creation d'un utilisateur et retour du token JWT + User.
     *
     * @return array{token: string, user: User}
     */
    private function createUserAndGetToken(string $email): array
    {
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($hasher->hashPassword($user, 'password'));
        $user->setFirstName('Test');
        $user->setLastName('Notif');

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

        return ['token' => $response['token'], 'user' => $user];
    }

    /**
     * Creation d'une notification de test.
     * Rafraichit l'EntityManager pour gerer les entites detachees apres requetes HTTP.
     */
    private function createNotification(User $user, string $title = 'Test notification'): Notification
    {
        /** @var EntityManagerInterface $em */
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $this->entityManager = $em;

        /** @var User $managedUser */
        $managedUser = $this->entityManager->find(User::class, $user->getId());

        $notification = new Notification();
        $notification->setUser($managedUser);
        $notification->setTitle($title);
        $notification->setType('info');
        $notification->setMessage('Ceci est un test.');

        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        return $notification;
    }

    public function testListNotificationsUnauthenticated(): void
    {
        $this->client->request('GET', '/api/notifications');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testListNotifications(): void
    {
        ['token' => $token, 'user' => $user] = $this->createUserAndGetToken('notif-list@test.dev');

        $this->createNotification($user, 'Notification 1');
        $this->createNotification($user, 'Notification 2');

        $this->client->request('GET', '/api/notifications', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('items', $response);
        self::assertArrayHasKey('total', $response);
        self::assertArrayHasKey('unread', $response);
        self::assertCount(2, $response['items']);
        self::assertSame(2, $response['unread']);
    }

    public function testUnreadCount(): void
    {
        ['token' => $token, 'user' => $user] = $this->createUserAndGetToken('notif-unread@test.dev');

        $this->createNotification($user);

        $this->client->request('GET', '/api/notifications/unread-count', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertSame(1, $response['count']);
    }

    public function testMarkAsRead(): void
    {
        ['token' => $token, 'user' => $user] = $this->createUserAndGetToken('notif-read@test.dev');

        $notification = $this->createNotification($user);

        $this->client->request('PATCH', '/api/notifications/'.$notification->getId().'/read', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        // Verification du compteur non lu
        $this->client->request('GET', '/api/notifications/unread-count', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertSame(0, $response['count']);
    }

    public function testMarkAllAsRead(): void
    {
        ['token' => $token, 'user' => $user] = $this->createUserAndGetToken('notif-all-read@test.dev');

        $this->createNotification($user, 'Notif A');
        $this->createNotification($user, 'Notif B');
        $this->createNotification($user, 'Notif C');

        $this->client->request('POST', '/api/notifications/mark-all-read', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertSame(3, $response['count']);
    }

    public function testDeleteNotification(): void
    {
        ['token' => $token, 'user' => $user] = $this->createUserAndGetToken('notif-delete@test.dev');

        $notification = $this->createNotification($user);

        $this->client->request('DELETE', '/api/notifications/'.$notification->getId(), [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
    }

    public function testCannotAccessOtherUserNotification(): void
    {
        ['token' => $tokenA] = $this->createUserAndGetToken('notif-user-a@test.dev');
        ['user' => $userB] = $this->createUserAndGetToken('notif-user-b@test.dev');

        $notification = $this->createNotification($userB);

        // L'utilisateur A essaie de lire la notification de B
        $this->client->request('PATCH', '/api/notifications/'.$notification->getId().'/read', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$tokenA,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        unset($this->entityManager);
    }
}
