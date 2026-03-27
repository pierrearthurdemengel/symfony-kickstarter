<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

// Force l'environnement de test (necessaire quand APP_ENV est defini par Docker)
$_SERVER['APP_ENV'] = 'test';
$_ENV['APP_ENV'] = 'test';
putenv('APP_ENV=test');

if (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}
