<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\FeatureFlagService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoints pour les feature flags.
 * GET public pour le frontend, PUT admin pour modifier.
 */
final class FeatureFlagController extends AbstractController
{
    public function __construct(
        private readonly FeatureFlagService $featureFlagService,
    ) {
    }

    /**
     * Retourne tous les feature flags actifs.
     */
    #[Route('/api/feature-flags', name: 'api_feature_flags', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json($this->featureFlagService->getAllFlags());
    }

    /**
     * Met a jour un feature flag (admin uniquement).
     */
    #[Route('/api/admin/feature-flags/{flag}', name: 'api_admin_feature_flags_update', methods: ['PUT'])]
    public function update(string $flag, Request $request): JsonResponse
    {
        /** @var array{enabled?: bool} $data */
        $data = json_decode($request->getContent(), true);

        if (!isset($data['enabled'])) {
            return $this->json(['error' => 'Le champ "enabled" est requis.'], Response::HTTP_BAD_REQUEST);
        }

        $this->featureFlagService->setFlag($flag, (bool) $data['enabled']);

        return $this->json(['flag' => $flag, 'enabled' => $data['enabled']]);
    }
}
