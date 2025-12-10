<?php
/**
 * Routeur pour le serveur PHP intégré
 * php -S localhost:8000 server-router.php
 */

$requestUri = $_SERVER["REQUEST_URI"];
$file = __DIR__ . $requestUri;

// Enlever le query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Si c'est un dossier existant ou un fichier statique, le servir directement
if ($path === '/' || (file_exists($file) && is_file($file))) {
    return false;
}

// Si c'est une requête Backend, la traiter
if (strpos($path, '/Backend/') === 0) {
    $_SERVER['REQUEST_URI'] = $path;
    $_SERVER['SCRIPT_NAME'] = '/server-router.php';
    require_once __DIR__ . '/Backend/router.php';
    exit;
}

// Sinon, servir index.html si le fichier n'existe pas
echo "API FinanceFlow";
exit;
?>
