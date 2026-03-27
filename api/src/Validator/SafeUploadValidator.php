<?php

declare(strict_types=1);

namespace App\Validator;

use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Validation securisee des fichiers uploades : verification du type MIME reel
 * via le contenu binaire du fichier (pas seulement l'extension).
 * Protection contre les attaques SSRF et les fichiers deguises.
 */
final class SafeUploadValidator
{
    /** Types MIME autorises par categorie */
    private const array ALLOWED_MIME_TYPES = [
        'image' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ],
        'document' => [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
    ];

    /** Taille maximale par defaut : 5 Mo */
    private const int MAX_FILE_SIZE = 5 * 1024 * 1024;

    /** Extensions bloquees (executables, scripts) */
    private const array BLOCKED_EXTENSIONS = [
        'php', 'phar', 'phtml', 'php3', 'php4', 'php5', 'phps',
        'sh', 'bash', 'bat', 'cmd', 'com', 'exe', 'msi',
        'js', 'jar', 'py', 'rb', 'pl', 'cgi',
        'htaccess', 'htpasswd',
    ];

    /**
     * Valide un fichier uploade : type MIME reel, extension, taille.
     *
     * @param list<string> $allowedCategories
     *
     * @return list<string> Liste des erreurs (vide si valide)
     */
    public function validate(UploadedFile $file, array $allowedCategories = ['image']): array
    {
        $errors = [];

        // Verification de la taille
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            $errors[] = sprintf(
                'Le fichier depasse la taille maximale autorisee (%d Mo).',
                self::MAX_FILE_SIZE / (1024 * 1024),
            );
        }

        // Verification de l'extension
        $extension = strtolower($file->getClientOriginalExtension());
        if (\in_array($extension, self::BLOCKED_EXTENSIONS, true)) {
            $errors[] = sprintf('L\'extension ".%s" n\'est pas autorisee.', $extension);
        }

        // Verification du type MIME reel (finfo, pas l'extension)
        $realMimeType = $file->getMimeType();
        $allowedMimes = $this->getAllowedMimeTypes($allowedCategories);

        if (null === $realMimeType || !\in_array($realMimeType, $allowedMimes, true)) {
            $errors[] = sprintf(
                'Type de fichier non autorise : "%s". Types acceptes : %s.',
                $realMimeType ?? 'inconnu',
                implode(', ', $allowedMimes),
            );
        }

        // Verification de la coherence extension/MIME
        if (null !== $realMimeType && \count($errors) === 0) {
            $declaredMime = $file->getClientMimeType();
            if (null !== $declaredMime && $declaredMime !== $realMimeType) {
                $errors[] = 'Le type MIME declare ne correspond pas au contenu reel du fichier.';
            }
        }

        return $errors;
    }

    /**
     * Construit la liste des types MIME autorises a partir des categories.
     *
     * @param list<string> $categories
     *
     * @return list<string>
     */
    private function getAllowedMimeTypes(array $categories): array
    {
        $mimes = [];

        foreach ($categories as $category) {
            if (isset(self::ALLOWED_MIME_TYPES[$category])) {
                $mimes = array_merge($mimes, self::ALLOWED_MIME_TYPES[$category]);
            }
        }

        return array_values(array_unique($mimes));
    }
}
