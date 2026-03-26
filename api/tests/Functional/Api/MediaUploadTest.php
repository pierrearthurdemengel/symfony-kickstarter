<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class MediaUploadTest extends WebTestCase
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
     * Creation d'un utilisateur de test et obtention du token JWT.
     */
    private function createTestUserAndGetToken(string $email = 'media@test.dev', string $password = 'password'): string
    {
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($hasher->hashPassword($user, $password));
        $user->setFirstName('Test');
        $user->setLastName('Media');

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
     * Creation d'un fichier image temporaire pour les tests.
     */
    private function createTestImage(string $name = 'test.jpg', string $mimeType = 'image/jpeg', int $sizeKb = 10): UploadedFile
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'media_test_');
        if ($tempFile === false) {
            throw new \RuntimeException('Impossible de creer un fichier temporaire.');
        }

        // Remplissage avec des donnees aleatoires pour simuler la taille
        file_put_contents($tempFile, str_repeat('x', $sizeKb * 1024));

        return new UploadedFile($tempFile, $name, $mimeType, null, true);
    }

    public function testUploadValidImage(): void
    {
        $token = $this->createTestUserAndGetToken();
        $file = $this->createTestImage();

        $this->client->request('POST', '/api/media', [], ['file' => $file], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        /** @var array<string, mixed> $response */
        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('id', $response);
        self::assertArrayHasKey('filePath', $response);
        self::assertArrayHasKey('originalName', $response);
        self::assertSame('test.jpg', $response['originalName']);
    }

    public function testUploadFileTooLarge(): void
    {
        $token = $this->createTestUserAndGetToken('media-large@test.dev');

        // Fichier de 11 Mo (depasse la limite de 10 Mo)
        $file = $this->createTestImage('large.jpg', 'image/jpeg', 11 * 1024);

        $this->client->request('POST', '/api/media', [], ['file' => $file], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);

        /** @var array{error: string} $response */
        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('error', $response);
    }

    public function testUploadDisallowedType(): void
    {
        $token = $this->createTestUserAndGetToken('media-type@test.dev');
        $file = $this->createTestImage('script.exe', 'application/x-executable');

        $this->client->request('POST', '/api/media', [], ['file' => $file], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);

        /** @var array{error: string} $response */
        $response = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('error', $response);
    }

    public function testUploadWithoutAuthentication(): void
    {
        $file = $this->createTestImage();

        $this->client->request('POST', '/api/media', [], ['file' => $file]);

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        unset($this->entityManager);
    }
}
