<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserOAuthProvider;
use App\Repository\UserOAuthProviderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Throwable;

/**
 * Endpoints OAuth pour l'authentification sociale (Google, GitHub).
 * Flux : le frontend redirige vers le provider, le provider redirige vers le callback
 * avec un code d'autorisation, le backend echange le code contre un token d'acces
 * puis cree/lie l'utilisateur et retourne un JWT.
 */
final class OAuthController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserOAuthProviderRepository $oauthRepository,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly HttpClientInterface $httpClient,
    ) {
    }

    /**
     * Echange un code d'autorisation OAuth contre un JWT.
     * Le frontend gere la redirection vers le provider et transmet le code.
     */
    #[Route('/api/oauth/{provider}/callback', name: 'api_oauth_callback', methods: ['POST'])]
    public function callback(string $provider, Request $request): JsonResponse
    {
        if (!\in_array($provider, ['google', 'github'], true)) {
            return $this->json(['error' => 'Fournisseur OAuth non supporte.'], Response::HTTP_BAD_REQUEST);
        }

        /** @var array{code?: string, redirectUri?: string} $data */
        $data = json_decode($request->getContent(), true);
        $code = $data['code'] ?? '';
        $redirectUri = $data['redirectUri'] ?? '';

        if ('' === $code) {
            return $this->json(['error' => 'Code d\'autorisation manquant.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $oauthUser = match ($provider) {
                'google' => $this->getGoogleUser($code, $redirectUri),
                'github' => $this->getGithubUser($code),
            };
        } catch (Throwable) {
            return $this->json(
                ['error' => 'Erreur lors de l\'authentification OAuth.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        // Recherche d'un compte OAuth existant
        $oauthProvider = $this->oauthRepository->findByProviderAndProviderId(
            $provider,
            $oauthUser['id'],
        );

        if (null !== $oauthProvider) {
            // Utilisateur existant, generation du JWT
            /** @var User $user */
            $user = $oauthProvider->getUser();
            $token = $this->jwtManager->create($user);

            return $this->json(['token' => $token]);
        }

        // Recherche par email
        $user = $this->entityManager->getRepository(User::class)->findOneBy([
            'email' => $oauthUser['email'],
        ]);

        if (null === $user) {
            // Creation d'un nouvel utilisateur
            $user = new User();
            $user->setEmail($oauthUser['email']);
            $user->setFirstName($oauthUser['firstName'] ?? null);
            $user->setLastName($oauthUser['lastName'] ?? null);
            $user->setRoles(['ROLE_USER']);
            $user->setIsEmailVerified(true);

            // Mot de passe aleatoire (login uniquement via OAuth)
            $randomPassword = bin2hex(random_bytes(32));
            $user->setPassword($this->passwordHasher->hashPassword($user, $randomPassword));

            $this->entityManager->persist($user);
        }

        // Creation du lien OAuth
        $link = new UserOAuthProvider();
        $link->setUser($user);
        $link->setProvider($provider);
        $link->setProviderUserId($oauthUser['id']);
        $link->setAccessToken($oauthUser['accessToken']);

        $this->entityManager->persist($link);
        $this->entityManager->flush();

        $token = $this->jwtManager->create($user);

        return $this->json(['token' => $token], Response::HTTP_CREATED);
    }

    /**
     * Retourne l'URL d'autorisation OAuth pour le frontend.
     */
    #[Route('/api/oauth/{provider}/url', name: 'api_oauth_url', methods: ['GET'])]
    public function authUrl(string $provider, Request $request): JsonResponse
    {
        $redirectUri = $request->query->get('redirectUri', '');

        $url = match ($provider) {
            'google' => $this->getGoogleAuthUrl($redirectUri),
            'github' => $this->getGithubAuthUrl(),
            default => null,
        };

        if (null === $url) {
            return $this->json(['error' => 'Fournisseur non supporte.'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json(['url' => $url]);
    }

    /**
     * @return array{id: string, email: string, firstName: ?string, lastName: ?string, accessToken: string}
     */
    private function getGoogleUser(string $code, string $redirectUri): array
    {
        $clientId = $this->getParameter('app.google_client_id');
        $clientSecret = $this->getParameter('app.google_client_secret');

        // Echange du code contre un access token
        $tokenResponse = $this->httpClient->request('POST', 'https://oauth2.googleapis.com/token', [
            'body' => [
                'code' => $code,
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirectUri,
                'grant_type' => 'authorization_code',
            ],
        ]);

        /** @var array{access_token: string} $tokenData */
        $tokenData = $tokenResponse->toArray();
        $accessToken = $tokenData['access_token'];

        // Recuperation du profil
        $profileResponse = $this->httpClient->request('GET', 'https://www.googleapis.com/oauth2/v2/userinfo', [
            'headers' => ['Authorization' => 'Bearer '.$accessToken],
        ]);

        /** @var array{id: string, email: string, given_name?: string, family_name?: string} $profile */
        $profile = $profileResponse->toArray();

        return [
            'id' => $profile['id'],
            'email' => $profile['email'],
            'firstName' => $profile['given_name'] ?? null,
            'lastName' => $profile['family_name'] ?? null,
            'accessToken' => $accessToken,
        ];
    }

    /**
     * @return array{id: string, email: string, firstName: ?string, lastName: ?string, accessToken: string}
     */
    private function getGithubUser(string $code): array
    {
        $clientId = $this->getParameter('app.github_client_id');
        $clientSecret = $this->getParameter('app.github_client_secret');

        // Echange du code contre un access token
        $tokenResponse = $this->httpClient->request('POST', 'https://github.com/login/oauth/access_token', [
            'body' => [
                'code' => $code,
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
            ],
            'headers' => ['Accept' => 'application/json'],
        ]);

        /** @var array{access_token: string} $tokenData */
        $tokenData = $tokenResponse->toArray();
        $accessToken = $tokenData['access_token'];

        // Recuperation du profil
        $profileResponse = $this->httpClient->request('GET', 'https://api.github.com/user', [
            'headers' => [
                'Authorization' => 'Bearer '.$accessToken,
                'Accept' => 'application/json',
            ],
        ]);

        /** @var array{id: int, login: string, name?: string, email?: string} $profile */
        $profile = $profileResponse->toArray();

        // L'email peut etre prive sur GitHub, recuperation via l'endpoint emails
        $email = $profile['email'] ?? '';
        if ('' === $email) {
            $emailsResponse = $this->httpClient->request('GET', 'https://api.github.com/user/emails', [
                'headers' => [
                    'Authorization' => 'Bearer '.$accessToken,
                    'Accept' => 'application/json',
                ],
            ]);

            /** @var array<int, array{email: string, primary: bool}> $emails */
            $emails = $emailsResponse->toArray();
            foreach ($emails as $e) {
                if ($e['primary']) {
                    $email = $e['email'];
                    break;
                }
            }
        }

        $nameParts = explode(' ', $profile['name'] ?? $profile['login'], 2);

        return [
            'id' => (string) $profile['id'],
            'email' => $email,
            'firstName' => $nameParts[0] ?? null,
            'lastName' => $nameParts[1] ?? null,
            'accessToken' => $accessToken,
        ];
    }

    private function getGoogleAuthUrl(string $redirectUri): string
    {
        $clientId = $this->getParameter('app.google_client_id');

        return 'https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'offline',
        ]);
    }

    private function getGithubAuthUrl(): string
    {
        $clientId = $this->getParameter('app.github_client_id');

        return 'https://github.com/login/oauth/authorize?'.http_build_query([
            'client_id' => $clientId,
            'scope' => 'user:email read:user',
        ]);
    }
}
