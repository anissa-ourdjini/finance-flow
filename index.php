<?php
/**
 * Point d'entrée principal - FinanceFlow
 * Redirige vers le frontend (Frontend/dist) ou l'API Backend
 */

// Récupérer la route originale passée par .htaccess
$requestPath = $_GET['_route'] ?? '/';

// S'assurer que ça commence par /
if (strpos($requestPath, '/') !== 0) {
    $requestPath = '/' . $requestPath;
}

// Si c'est une requête API
if (strpos($requestPath, '/api') === 0 || strpos($requestPath, '/Backend') === 0) {
    // Redirige vers le routeur Backend
    $_SERVER['REQUEST_URI'] = $requestPath;
    require_once __DIR__ . '/Backend/router.php';
    exit;
}

// Sinon, servir le frontend
$frontendPath = __DIR__ . '/Frontend/dist';

// Si la racine, servir index.html
if ($requestPath === '/' || $requestPath === '') {
    if (file_exists($frontendPath . '/index.html')) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($frontendPath . '/index.html');
        exit;
    }
}

// Vérifier si le fichier existe dans Frontend/dist
$filePath = $frontendPath . $requestPath;
if (file_exists($filePath) && is_file($filePath)) {
    // Détecter le type MIME
    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
    $mimeTypes = [
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
    ];
    
    $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
    header('Content-Type: ' . $mimeType);
    readfile($filePath);
    exit;
}

// Servir index.html pour le SPA routing
if (file_exists($frontendPath . '/index.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($frontendPath . '/index.html');
    exit;
}

// 404
http_response_code(404);
echo 'FinanceFlow - Not found';
?>
