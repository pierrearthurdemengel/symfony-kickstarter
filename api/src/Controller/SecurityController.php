<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Point d'entree pour l'authentification JSON.
 * Le firewall json_login intercepte la requete avant que cette action ne soit executee.
 */
final class SecurityController extends AbstractController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // Cette methode n'est jamais atteinte : le firewall json_login intercepte la requete
        $user = $this->getUser();

        return $this->json([
            'message' => 'Authentification reussie.',
        ]);
    }
}
