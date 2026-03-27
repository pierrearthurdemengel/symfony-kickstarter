<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoints pour l'authentification a deux facteurs (TOTP).
 */
final class TwoFactorController extends AbstractController
{
    /** Longueur du secret TOTP (base32) */
    private const int SECRET_LENGTH = 20;

    /** Intervalle de validite du code TOTP en secondes */
    private const int TOTP_PERIOD = 30;

    /** Nombre de codes de secours generes */
    private const int BACKUP_CODES_COUNT = 8;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    /**
     * Initie l'activation du 2FA : genere un secret et retourne le QR code.
     */
    #[Route('/api/2fa/enable', name: 'api_2fa_enable', methods: ['POST'])]
    public function enable(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($user->isTwoFactorEnabled()) {
            return $this->json(['error' => 'Le 2FA est deja active.'], Response::HTTP_CONFLICT);
        }

        // Generation du secret TOTP
        $secret = $this->generateSecret();
        $user->setTotpSecret($secret);
        $this->entityManager->flush();

        // Construction de l'URI otpauth pour le QR code
        $issuer = 'Kickstarter';
        $otpauthUri = \sprintf(
            'otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=%d',
            rawurlencode($issuer),
            rawurlencode((string) $user->getEmail()),
            $secret,
            rawurlencode($issuer),
            self::TOTP_PERIOD,
        );

        return $this->json([
            'secret' => $secret,
            'otpauthUri' => $otpauthUri,
        ]);
    }

    /**
     * Confirme l'activation du 2FA avec un code TOTP valide.
     */
    #[Route('/api/2fa/confirm', name: 'api_2fa_confirm', methods: ['POST'])]
    public function confirm(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        /** @var array{code?: string} $data */
        $data = json_decode($request->getContent(), true);
        $code = $data['code'] ?? '';

        $secret = $user->getTotpSecret();
        if (null === $secret) {
            return $this->json(
                ['error' => 'Aucun secret TOTP configure. Appelez /api/2fa/enable d\'abord.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        if (!$this->verifyTotpCode($secret, $code)) {
            return $this->json(['error' => 'Code TOTP invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $user->setIsTwoFactorEnabled(true);

        // Generation des codes de secours
        $backupCodes = $this->generateBackupCodes();
        $user->setBackupCodes($backupCodes);

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Authentification a deux facteurs activee.',
            'backupCodes' => $backupCodes,
        ]);
    }

    /**
     * Desactive le 2FA (necessite le mot de passe actuel).
     */
    #[Route('/api/2fa/disable', name: 'api_2fa_disable', methods: ['POST'])]
    public function disable(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        /** @var array{password?: string} $data */
        $data = json_decode($request->getContent(), true);
        $password = $data['password'] ?? '';

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Mot de passe incorrect.'], Response::HTTP_BAD_REQUEST);
        }

        $user->setIsTwoFactorEnabled(false);
        $user->setTotpSecret(null);
        $user->setBackupCodes(null);

        $this->entityManager->flush();

        return $this->json(['message' => 'Authentification a deux facteurs desactivee.']);
    }

    /**
     * Verifie un code TOTP pour completer l'authentification.
     * Utilise avec le token partiel retourne par le login quand le 2FA est actif.
     */
    #[Route('/api/2fa/verify', name: 'api_2fa_verify', methods: ['POST'])]
    public function verify(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        /** @var array{code?: string} $data */
        $data = json_decode($request->getContent(), true);
        $code = $data['code'] ?? '';

        $secret = $user->getTotpSecret();
        if (null === $secret || !$user->isTwoFactorEnabled()) {
            return $this->json(['error' => '2FA non active.'], Response::HTTP_BAD_REQUEST);
        }

        // Verification du code TOTP ou d'un code de secours
        $isValid = $this->verifyTotpCode($secret, $code);
        $isBackup = false;

        if (!$isValid) {
            // Tentative avec un code de secours
            $isBackup = $user->consumeBackupCode($code);
            if ($isBackup) {
                $this->entityManager->flush();
            }
        }

        if (!$isValid && !$isBackup) {
            return $this->json(['error' => 'Code invalide.'], Response::HTTP_BAD_REQUEST);
        }

        // Generation du JWT complet
        $token = $this->jwtManager->create($user);

        return $this->json([
            'token' => $token,
            'backupCodeUsed' => $isBackup,
        ]);
    }

    /**
     * Regenere les codes de secours.
     */
    #[Route('/api/2fa/backup-codes', name: 'api_2fa_backup_codes', methods: ['POST'])]
    public function regenerateBackupCodes(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user->isTwoFactorEnabled()) {
            return $this->json(['error' => '2FA non active.'], Response::HTTP_BAD_REQUEST);
        }

        $backupCodes = $this->generateBackupCodes();
        $user->setBackupCodes($backupCodes);
        $this->entityManager->flush();

        return $this->json(['backupCodes' => $backupCodes]);
    }

    /**
     * Genere un secret TOTP en base32.
     */
    private function generateSecret(): string
    {
        $base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';

        for ($i = 0; $i < self::SECRET_LENGTH; ++$i) {
            $secret .= $base32Chars[random_int(0, 31)];
        }

        return $secret;
    }

    /**
     * Verifie un code TOTP (fenetre de +/- 1 periode).
     */
    private function verifyTotpCode(string $secret, string $code): bool
    {
        $timeSlice = (int) floor(time() / self::TOTP_PERIOD);

        // Verification sur 3 fenetres (-1, 0, +1)
        for ($i = -1; $i <= 1; ++$i) {
            $calculatedCode = $this->calculateTotpCode($secret, $timeSlice + $i);
            if (hash_equals($calculatedCode, $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calcule un code TOTP pour un time slice donne.
     */
    private function calculateTotpCode(string $base32Secret, int $timeSlice): string
    {
        // Decodage base32
        $secretBytes = $this->base32Decode($base32Secret);

        // Pack du time slice en big-endian 64-bit
        $time = pack('N*', 0, $timeSlice);

        // HMAC-SHA1
        $hash = hash_hmac('sha1', $time, $secretBytes, true);

        // Extraction dynamique (RFC 4226)
        $offset = \ord($hash[19]) & 0x0F;
        $code = (
            ((\ord($hash[$offset]) & 0x7F) << 24) |
            ((\ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((\ord($hash[$offset + 2]) & 0xFF) << 8) |
            (\ord($hash[$offset + 3]) & 0xFF)
        ) % 1000000;

        return str_pad((string) $code, 6, '0', \STR_PAD_LEFT);
    }

    /**
     * Decode une chaine base32.
     */
    private function base32Decode(string $base32): string
    {
        $base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $base32 = strtoupper($base32);
        $buffer = 0;
        $bitsLeft = 0;
        $result = '';

        for ($i = 0, $len = \strlen($base32); $i < $len; ++$i) {
            $val = strpos($base32Chars, $base32[$i]);
            if (false === $val) {
                continue;
            }
            $buffer = ($buffer << 5) | $val;
            $bitsLeft += 5;
            if ($bitsLeft >= 8) {
                $bitsLeft -= 8;
                $result .= \chr(($buffer >> $bitsLeft) & 0xFF);
            }
        }

        return $result;
    }

    /**
     * Genere des codes de secours aleatoires.
     *
     * @return list<string>
     */
    private function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < self::BACKUP_CODES_COUNT; ++$i) {
            $codes[] = strtoupper(bin2hex(random_bytes(4)));
        }

        return $codes;
    }
}
