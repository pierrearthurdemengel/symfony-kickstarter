<?php

declare(strict_types=1);

namespace App\Tests\Unit\Command;

use App\Command\CleanExpiredTokensCommand;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query;
use Doctrine\ORM\QueryBuilder;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Tester\CommandTester;

final class CleanExpiredTokensCommandTest extends TestCase
{
    public function testDryRunDisplaysCount(): void
    {
        $em = $this->createMock(EntityManagerInterface::class);
        $qb = $this->createMock(QueryBuilder::class);
        $query = $this->createMock(Query::class);

        $em->method('createQueryBuilder')->willReturn($qb);
        $qb->method('select')->willReturnSelf();
        $qb->method('from')->willReturnSelf();
        $qb->method('where')->willReturnSelf();
        $qb->method('setParameter')->willReturnSelf();
        $qb->method('getQuery')->willReturn($query);

        // Simule 3 tokens reset + 2 tokens verification expires
        $query->method('getSingleScalarResult')
            ->willReturnOnConsecutiveCalls(3, 2);

        $command = new CleanExpiredTokensCommand($em);

        $application = new Application();
        $application->add($command);

        $commandTester = new CommandTester($application->find('app:clean-expired-tokens'));
        $commandTester->execute(['--dry-run' => true]);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('5 token(s)', $output);
        self::assertStringContainsString('3 reset password', $output);
        self::assertStringContainsString('2 verification', $output);
        self::assertSame(0, $commandTester->getStatusCode());
    }

    public function testExecuteDeletesTokens(): void
    {
        $em = $this->createMock(EntityManagerInterface::class);
        $qb = $this->createMock(QueryBuilder::class);
        $query = $this->createMock(Query::class);

        $em->method('createQueryBuilder')->willReturn($qb);
        $qb->method('delete')->willReturnSelf();
        $qb->method('where')->willReturnSelf();
        $qb->method('setParameter')->willReturnSelf();
        $qb->method('getQuery')->willReturn($query);

        // Simule 2 tokens reset + 1 token verification supprimes
        $query->method('execute')
            ->willReturnOnConsecutiveCalls(2, 1);

        $command = new CleanExpiredTokensCommand($em);

        $application = new Application();
        $application->add($command);

        $commandTester = new CommandTester($application->find('app:clean-expired-tokens'));
        $commandTester->execute([]);

        $output = $commandTester->getDisplay();
        self::assertStringContainsString('3 token(s)', $output);
        self::assertSame(0, $commandTester->getStatusCode());
    }
}
