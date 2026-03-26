<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\EmailVerificationToken;
use App\Entity\ResetPasswordToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Commande de nettoyage des tokens expires.
 * A planifier via un cron pour maintenir la base propre.
 */
#[AsCommand(
    name: 'app:clean-expired-tokens',
    description: 'Supprime les tokens expires (reset password + verification email)',
)]
class CleanExpiredTokensCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption(
            'dry-run',
            null,
            InputOption::VALUE_NONE,
            'Affiche le nombre de tokens a supprimer sans les supprimer',
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $dryRun = (bool) $input->getOption('dry-run');
        $now = new \DateTimeImmutable();

        // Nettoyage des tokens de reset de mot de passe
        $resetCount = $this->cleanTokens(
            ResetPasswordToken::class,
            $now,
            $dryRun,
        );

        // Nettoyage des tokens de verification email
        $verifyCount = $this->cleanTokens(
            EmailVerificationToken::class,
            $now,
            $dryRun,
        );

        $total = $resetCount + $verifyCount;

        if ($dryRun) {
            $io->note(sprintf(
                '[DRY-RUN] %d token(s) a supprimer (%d reset password, %d verification email)',
                $total,
                $resetCount,
                $verifyCount,
            ));
        } else {
            $io->success(sprintf(
                '%d token(s) expire(s) supprime(s) (%d reset password, %d verification email)',
                $total,
                $resetCount,
                $verifyCount,
            ));
        }

        return Command::SUCCESS;
    }

    /**
     * Supprime les tokens expires d'une table donnee.
     *
     * @param class-string $entityClass
     */
    private function cleanTokens(
        string $entityClass,
        \DateTimeImmutable $now,
        bool $dryRun,
    ): int {
        $qb = $this->entityManager->createQueryBuilder();

        if ($dryRun) {
            $count = (int) $qb
                ->select('COUNT(t)')
                ->from($entityClass, 't')
                ->where('t.expiresAt < :now')
                ->setParameter('now', $now)
                ->getQuery()
                ->getSingleScalarResult();

            return $count;
        }

        return (int) $qb
            ->delete($entityClass, 't')
            ->where('t.expiresAt < :now')
            ->setParameter('now', $now)
            ->getQuery()
            ->execute();
    }
}
