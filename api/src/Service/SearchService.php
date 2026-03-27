<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Service de recherche via Meilisearch.
 * Gere l'indexation et la recherche dans les index Meilisearch.
 */
final readonly class SearchService
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private LoggerInterface $logger,
        private string $meilisearchUrl,
        private string $meilisearchApiKey,
    ) {
    }

    /**
     * Recherche dans un index Meilisearch.
     *
     * @param array<string, mixed> $options Options supplementaires (limit, offset, filter, sort)
     * @return array{hits: list<array<string, mixed>>, estimatedTotalHits: int, processingTimeMs: int}
     */
    public function search(string $index, string $query, array $options = []): array
    {
        try {
            $body = array_merge(['q' => $query], $options);

            $response = $this->httpClient->request('POST', "{$this->meilisearchUrl}/indexes/{$index}/search", [
                'headers' => [
                    'Authorization' => "Bearer {$this->meilisearchApiKey}",
                    'Content-Type' => 'application/json',
                ],
                'json' => $body,
            ]);

            /** @var array{hits: list<array<string, mixed>>, estimatedTotalHits: int, processingTimeMs: int} $data */
            $data = $response->toArray();

            return $data;
        } catch (\Throwable $e) {
            $this->logger->error('Erreur Meilisearch : {message}', ['message' => $e->getMessage()]);

            return ['hits' => [], 'estimatedTotalHits' => 0, 'processingTimeMs' => 0];
        }
    }

    /**
     * Indexe un document dans Meilisearch.
     *
     * @param array<string, mixed> $document
     */
    public function index(string $indexName, array $document): void
    {
        try {
            $this->httpClient->request('POST', "{$this->meilisearchUrl}/indexes/{$indexName}/documents", [
                'headers' => [
                    'Authorization' => "Bearer {$this->meilisearchApiKey}",
                    'Content-Type' => 'application/json',
                ],
                'json' => [$document],
            ]);
        } catch (\Throwable $e) {
            $this->logger->warning('Echec indexation Meilisearch : {message}', ['message' => $e->getMessage()]);
        }
    }

    /**
     * Indexe plusieurs documents en lot.
     *
     * @param list<array<string, mixed>> $documents
     */
    public function indexBatch(string $indexName, array $documents): void
    {
        if ([] === $documents) {
            return;
        }

        try {
            $this->httpClient->request('POST', "{$this->meilisearchUrl}/indexes/{$indexName}/documents", [
                'headers' => [
                    'Authorization' => "Bearer {$this->meilisearchApiKey}",
                    'Content-Type' => 'application/json',
                ],
                'json' => $documents,
            ]);
        } catch (\Throwable $e) {
            $this->logger->warning('Echec indexation batch Meilisearch : {message}', ['message' => $e->getMessage()]);
        }
    }

    /**
     * Supprime un document d'un index.
     */
    public function delete(string $indexName, string $documentId): void
    {
        try {
            $this->httpClient->request('DELETE', "{$this->meilisearchUrl}/indexes/{$indexName}/documents/{$documentId}", [
                'headers' => [
                    'Authorization' => "Bearer {$this->meilisearchApiKey}",
                ],
            ]);
        } catch (\Throwable $e) {
            $this->logger->warning('Echec suppression Meilisearch : {message}', ['message' => $e->getMessage()]);
        }
    }

    /**
     * Configure les attributs filtrable et triable d'un index.
     *
     * @param list<string> $filterableAttributes
     * @param list<string> $sortableAttributes
     */
    public function configureIndex(string $indexName, array $filterableAttributes = [], array $sortableAttributes = []): void
    {
        try {
            if ([] !== $filterableAttributes) {
                $this->httpClient->request('PUT', "{$this->meilisearchUrl}/indexes/{$indexName}/settings/filterable-attributes", [
                    'headers' => [
                        'Authorization' => "Bearer {$this->meilisearchApiKey}",
                        'Content-Type' => 'application/json',
                    ],
                    'json' => $filterableAttributes,
                ]);
            }

            if ([] !== $sortableAttributes) {
                $this->httpClient->request('PUT', "{$this->meilisearchUrl}/indexes/{$indexName}/settings/sortable-attributes", [
                    'headers' => [
                        'Authorization' => "Bearer {$this->meilisearchApiKey}",
                        'Content-Type' => 'application/json',
                    ],
                    'json' => $sortableAttributes,
                ]);
            }
        } catch (\Throwable $e) {
            $this->logger->warning('Echec configuration index Meilisearch : {message}', ['message' => $e->getMessage()]);
        }
    }
}
