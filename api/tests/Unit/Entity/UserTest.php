<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

final class UserTest extends TestCase
{
    public function testCreateUserWithAllProperties(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setPassword('hashed_password');
        $user->setFirstName('Jean');
        $user->setLastName('Dupont');
        $user->setRoles(['ROLE_USER']);

        self::assertNull($user->getId());
        self::assertSame('test@example.com', $user->getEmail());
        self::assertSame('hashed_password', $user->getPassword());
        self::assertSame('Jean', $user->getFirstName());
        self::assertSame('Dupont', $user->getLastName());
    }

    public function testGetRolesAlwaysContainsRoleUser(): void
    {
        $user = new User();

        // Sans role defini, ROLE_USER est present
        self::assertContains('ROLE_USER', $user->getRoles());

        // Avec ROLE_ADMIN, ROLE_USER est toujours present
        $user->setRoles(['ROLE_ADMIN']);
        $roles = $user->getRoles();
        self::assertContains('ROLE_USER', $roles);
        self::assertContains('ROLE_ADMIN', $roles);
    }

    public function testGetRolesNoDuplicates(): void
    {
        $user = new User();
        $user->setRoles(['ROLE_USER', 'ROLE_USER']);

        $roles = $user->getRoles();
        self::assertCount(1, $roles);
        self::assertSame(['ROLE_USER'], $roles);
    }

    public function testEraseCredentials(): void
    {
        $user = new User();
        $user->setPlainPassword('secret_password');

        self::assertSame('secret_password', $user->getPlainPassword());

        $user->eraseCredentials();

        self::assertNull($user->getPlainPassword());
    }

    public function testGetUserIdentifierReturnsEmail(): void
    {
        $user = new User();
        $user->setEmail('identifier@example.com');

        self::assertSame('identifier@example.com', $user->getUserIdentifier());
    }

    public function testGetUserIdentifierReturnsEmptyStringWhenNoEmail(): void
    {
        $user = new User();

        self::assertSame('', $user->getUserIdentifier());
    }

    public function testSetCreatedAtValue(): void
    {
        $user = new User();
        $user->setCreatedAtValue();

        self::assertInstanceOf(\DateTimeImmutable::class, $user->getCreatedAt());
        self::assertInstanceOf(\DateTimeImmutable::class, $user->getUpdatedAt());
    }

    public function testSetUpdatedAtValue(): void
    {
        $user = new User();
        $user->setCreatedAtValue();
        $originalUpdatedAt = $user->getUpdatedAt();

        // Simulation d'un delai
        usleep(1000);
        $user->setUpdatedAtValue();

        self::assertInstanceOf(\DateTimeImmutable::class, $user->getUpdatedAt());
    }

    public function testPlainPassword(): void
    {
        $user = new User();
        self::assertNull($user->getPlainPassword());

        $user->setPlainPassword('my_password');
        self::assertSame('my_password', $user->getPlainPassword());

        $user->setPlainPassword(null);
        self::assertNull($user->getPlainPassword());
    }

    public function testSetAndGetDates(): void
    {
        $user = new User();
        $now = new \DateTimeImmutable();

        $user->setCreatedAt($now);
        $user->setUpdatedAt($now);

        self::assertSame($now, $user->getCreatedAt());
        self::assertSame($now, $user->getUpdatedAt());
    }

    public function testFluentInterface(): void
    {
        $user = new User();

        $result = $user
            ->setEmail('fluent@example.com')
            ->setPassword('password')
            ->setFirstName('Jean')
            ->setLastName('Dupont')
            ->setRoles(['ROLE_USER'])
            ->setPlainPassword('plain');

        self::assertSame($user, $result);
    }
}
