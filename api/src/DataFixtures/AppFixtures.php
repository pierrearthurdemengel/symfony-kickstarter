<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AppFixtures extends Fixture
{
    /** @var list<string> */
    private const FIRST_NAMES = [
        'Antoine', 'Baptiste', 'Camille', 'David', 'Emma',
        'Fabien', 'Gabriel', 'Hugo', 'Ines', 'Julie',
        'Kevin', 'Lea', 'Mathieu', 'Nicolas', 'Oceane',
        'Pierre', 'Quentin', 'Raphael', 'Sophie', 'Thomas',
        'Valentin', 'William', 'Xavier', 'Yasmine', 'Zoe',
        'Alexandre', 'Benjamin', 'Charlotte', 'Dylan', 'Elise',
        'Florian', 'Guillaume', 'Helene', 'Ibrahim', 'Jade',
        'Killian', 'Louise', 'Maxime', 'Nathan', 'Olivia',
        'Paul', 'Romain', 'Sarah', 'Theo', 'Ugo',
        'Victor', 'Wendy', 'Axel', 'Yann', 'Clara',
    ];

    /** @var list<string> */
    private const LAST_NAMES = [
        'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert',
        'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
        'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia',
        'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
        'Morel', 'Girard', 'Andre', 'Lefevre', 'Mercier',
        'Dupont', 'Lambert', 'Bonnet', 'Francois', 'Martinez',
        'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc',
        'Guerin', 'Muller', 'Henry', 'Roussel', 'Nicolas',
        'Perrin', 'Morin', 'Mathieu', 'Clement', 'Gauthier',
        'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin',
    ];

    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        // Administrateur
        $admin = new User();
        $admin->setEmail('admin@kickstarter.dev');
        $admin->setFirstName('Admin');
        $admin->setLastName('Kickstarter');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'password'));
        $manager->persist($admin);

        // Utilisateur de test
        $user = new User();
        $user->setEmail('user@kickstarter.dev');
        $user->setFirstName('User');
        $user->setLastName('Test');
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($this->passwordHasher->hashPassword($user, 'password'));
        $manager->persist($user);

        // 50 utilisateurs generes avec des donnees realistes
        $usedEmails = ['admin@kickstarter.dev', 'user@kickstarter.dev'];

        for ($i = 0; $i < 50; ++$i) {
            $firstName = self::FIRST_NAMES[$i % \count(self::FIRST_NAMES)];
            $lastName = self::LAST_NAMES[$i % \count(self::LAST_NAMES)];
            $email = strtolower($firstName).'.'.strtolower($lastName).($i > 0 ? (string) $i : '').'@example.com';

            if (\in_array($email, $usedEmails, true)) {
                $email = strtolower($firstName).'.'.strtolower($lastName).'.'.$i.'@example.com';
            }

            $usedEmails[] = $email;

            $fakeUser = new User();
            $fakeUser->setEmail($email);
            $fakeUser->setFirstName($firstName);
            $fakeUser->setLastName($lastName);
            $fakeUser->setRoles(['ROLE_USER']);
            $fakeUser->setPassword($this->passwordHasher->hashPassword($fakeUser, 'password'));
            $manager->persist($fakeUser);
        }

        $manager->flush();
    }
}
