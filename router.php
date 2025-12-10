<?php
/**
 * Router - Point d'entrée principal pour les requêtes API
 * Redirige les requêtes /Backend/* vers Backend/router.php
 */

// Vérifier si c'est une requête API Backend
$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (strpos($requestPath, '/Backend/') === 0) {
    // C'est une requête API Backend - diriger vers Backend/router.php
    $_SERVER['REQUEST_URI'] = $requestPath;
    $_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/Backend/router.php';
    require_once __DIR__ . '/Backend/router.php';
    exit;
}

// Sinon, servir les fichiers statiques ou Frontend
$filePath = __DIR__ . $requestPath;

// Si c'est un fichier qui existe, le servir
if (file_exists($filePath) && is_file($filePath)) {
    return false; // Laisser PHP servir le fichier
}

// Sinon, rediriger vers index.html (pour le SPA)
// (mais ce router n'est utilisé que pour l'API en développement)
http_response_code(404);
echo json_encode(['error' => 'Not found: ' . $requestPath]);
exit;
?>
