<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\SearchService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoint de recherche globale via Meilisearch.
 */
final class SearchController extends AbstractController
{
    public function __construct(
        private readonly SearchService $searchService,
    ) {
    }

    /**
     * Recherche globale dans un index.
     */
    #[Route('/api/search/{index}', name: 'api_search', methods: ['GET'])]
    public function search(string $index, Request $request): JsonResponse
    {
        // Index autorises pour eviter l'acces a des index non prevus
        $allowedIndexes = ['users', 'notifications'];
        if (!\in_array($index, $allowedIndexes, true)) {
            return $this->json(['error' => 'Index non autorise.'], 400);
        }

        $query = $request->query->get('q', '');
        $limit = min((int) $request->query->get('limit', '20'), 100);
        $offset = max((int) $request->query->get('offset', '0'), 0);

        $results = $this->searchService->search($index, (string) $query, [
            'limit' => $limit,
            'offset' => $offset,
        ]);

        return $this->json($results);
    }
}
