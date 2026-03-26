<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\EmailVerificationToken;
use App\Entity\User;
use App\Repository\EmailVerificationTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;
use Twig\Environment;

final class EmailVerificationController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly EmailVerificationTokenRepository $tokenRepository,
        private readonly MailerInterface $mailer,
        private readonly Environment $twig,
    ) {
    }

    #[Route('/api/verify-email', name: 'api_verify_email', methods: ['GET'])]
    public function verify(Request $request): JsonResponse
    {
        $tokenValue = $request->query->getString('token', '');

        if ($tokenValue === '') {
            return $this->json(
                ['error' => 'Le parametre "token" est requis.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $token = $this->tokenRepository->findValidToken($tokenValue);

        if ($token === null) {
            return $this->json(
                ['error' => 'Token invalide ou expire.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $user = $token->getUser();
        if ($user === null) {
            return $this->json(
                ['error' => 'Utilisateur introuvable.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $user->setIsEmailVerified(true);

        $this->entityManager->remove($token);
        $this->entityManager->flush();

        return $this->json(['message' => 'Email verifie avec succes.'], Response::HTTP_OK);
    }

    #[Route('/api/resend-verification', name: 'api_resend_verification', methods: ['POST'])]
    public function resend(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(
                ['error' => 'Authentification requise.'],
                Response::HTTP_UNAUTHORIZED,
            );
        }

        if ($user->isEmailVerified()) {
            return $this->json(
                ['message' => 'L\'email est deja verifie.'],
                Response::HTTP_OK,
            );
        }

        $this->createAndSendVerificationToken($user);

        return $this->json(
            ['message' => 'Email de verification renvoye.'],
            Response::HTTP_OK,
        );
    }

    /**
     * Cree un token de verification et envoie l'email.
     */
    public function createAndSendVerificationToken(User $user): void
    {
        $token = new EmailVerificationToken();
        $token->setUser($user);
        $token->setToken(Uuid::v7()->toRfc4122());

        $this->entityManager->persist($token);
        $this->entityManager->flush();

        /** @var string $frontendUrl */
        $frontendUrl = $this->getParameter('app.frontend_url');
        $verificationUrl = $frontendUrl . '/api/verify-email?token=' . $token->getToken();

        $htmlContent = $this->twig->render('emails/verify_email.html.twig', [
            'user' => $user,
            'verificationUrl' => $verificationUrl,
        ]);

        $email = (new Email())
            ->from('noreply@kickstarter.dev')
            ->to($user->getEmail() ?? '')
            ->subject('Verifiez votre adresse email')
            ->html($htmlContent);

        $this->mailer->send($email);
    }
}
