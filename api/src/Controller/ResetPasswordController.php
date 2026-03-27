<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\ResetPasswordToken;
use App\Repository\ResetPasswordTokenRepository;
use App\Repository\UserRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Twig\Environment;

final class ResetPasswordController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly ResetPasswordTokenRepository $resetPasswordTokenRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly MailerInterface $mailer,
        private readonly Environment $twig,
    ) {
    }

    /**
     * Demande de reinitialisation de mot de passe.
     * Retourne toujours 200 pour ne pas reveler l'existence d'un compte.
     */
    #[Route('/api/forgot-password', name: 'api_forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request): JsonResponse
    {
        /** @var array{email?: string} $data */
        $data = json_decode($request->getContent(), true);

        if (!\is_array($data) || empty($data['email'])) {
            return $this->json(['message' => 'Si cette adresse existe, un email de reinitialisation a ete envoye.'], Response::HTTP_OK);
        }

        $user = $this->userRepository->findOneBy(['email' => $data['email']]);

        if (null !== $user) {
            $token = bin2hex(random_bytes(32));

            $resetToken = new ResetPasswordToken();
            $resetToken->setUser($user);
            $resetToken->setToken($token);
            $resetToken->setExpiresAt(new DateTimeImmutable('+1 hour'));

            $this->entityManager->persist($resetToken);
            $this->entityManager->flush();

            $resetUrl = \sprintf('%s/reset-password?token=%s', 'http://localhost:3010', $token);

            $htmlContent = $this->twig->render('emails/reset_password.html.twig', [
                'user' => $user,
                'resetUrl' => $resetUrl,
            ]);

            $email = (new Email())
                ->from('noreply@kickstarter.dev')
                ->to($user->getEmail() ?? '')
                ->subject('Reinitialisation de votre mot de passe')
                ->html($htmlContent);

            $this->mailer->send($email);
        }

        return $this->json(['message' => 'Si cette adresse existe, un email de reinitialisation a ete envoye.'], Response::HTTP_OK);
    }

    /**
     * Reinitialisation du mot de passe avec un token valide.
     */
    #[Route('/api/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        /** @var array{token?: string, password?: string} $data */
        $data = json_decode($request->getContent(), true);

        if (!\is_array($data) || empty($data['token']) || empty($data['password'])) {
            return $this->json(['error' => 'Token et mot de passe requis.'], Response::HTTP_BAD_REQUEST);
        }

        $resetToken = $this->resetPasswordTokenRepository->findValidToken($data['token']);

        if (null === $resetToken) {
            return $this->json(['error' => 'Token invalide ou expire.'], Response::HTTP_BAD_REQUEST);
        }

        $user = $resetToken->getUser();

        if (null === $user) {
            return $this->json(['error' => 'Token invalide ou expire.'], Response::HTTP_BAD_REQUEST);
        }

        if (\strlen($data['password']) < 8) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins 8 caracteres.'], Response::HTTP_BAD_REQUEST);
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $this->entityManager->remove($resetToken);
        $this->entityManager->flush();

        return $this->json(['message' => 'Mot de passe reinitialise avec succes.'], Response::HTTP_OK);
    }
}
