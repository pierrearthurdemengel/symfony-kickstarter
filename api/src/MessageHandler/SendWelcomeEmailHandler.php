<?php

declare(strict_types=1);

namespace App\MessageHandler;

use App\Entity\User;
use App\Message\SendWelcomeEmailMessage;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Mime\Email;
use Symfony\Component\Uid\Uuid;
use Twig\Environment;

#[AsMessageHandler]
final readonly class SendWelcomeEmailHandler
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private MailerInterface $mailer,
        private Environment $twig,
        private LoggerInterface $logger,
    ) {
    }

    public function __invoke(SendWelcomeEmailMessage $message): void
    {
        $user = $this->entityManager->getRepository(User::class)->find(Uuid::fromString($message->getUserId()));

        if ($user === null) {
            $this->logger->warning('Utilisateur introuvable pour l\'envoi de l\'email de bienvenue.', [
                'userId' => $message->getUserId(),
            ]);

            return;
        }

        $htmlContent = $this->twig->render('emails/welcome.html.twig', [
            'user' => $user,
        ]);

        $email = (new Email())
            ->from('noreply@kickstarter.dev')
            ->to($user->getEmail() ?? '')
            ->subject('Bienvenue sur Kickstarter !')
            ->html($htmlContent);

        $this->mailer->send($email);

        $this->logger->info('Email de bienvenue envoye.', [
            'userId' => $message->getUserId(),
        ]);
    }
}
