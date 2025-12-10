<?php
/**
 * FinanceFlow - Point d'entrée principal
 * Router simple pour diriger les requêtes API vers le backend
 */

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Enlever le préfixe /FinanceFlow si présent
$requestPath = str_replace('/FinanceFlow', '', $requestPath);
$requestPath = trim($requestPath, '/');

// Si c'est une requête API, la router vers le backend
if (strpos($requestPath, 'Backend/') === 0) {
    $_SERVER['REQUEST_URI'] = '/' . $requestPath;
    $_SERVER['SCRIPT_NAME'] = '/index.php';
    require_once __DIR__ . '/Backend/router.php';
    exit;
}

// Sinon, c'est une requête pour le frontend
// En développement, on ne fait rien (le frontend est servi par Vite)
// En production, on servirait les fichiers build

echo "FinanceFlow Backend API";
exit;
?>

