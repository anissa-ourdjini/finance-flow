<?php
/**
 * Simple API proxy to handle CORS issues
 * Routes all requests to Backend/router.php
 */

header('Content-Type: application/json');

// CORS Headers - Allow all origins for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse the request
$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestPath = str_replace('/api.php', '', $requestPath);

// Log request
error_log(date('Y-m-d H:i:s') . ' - ' . $_SERVER['REQUEST_METHOD'] . ' ' . $requestPath);

// Forward to Backend router
$backendPath = __DIR__ . '/Backend/router.php';
$_SERVER['REQUEST_URI'] = '/Backend' . $requestPath;
$_SERVER['SCRIPT_NAME'] = '/Backend/router.php';
$_SERVER['SCRIPT_FILENAME'] = $backendPath;

// Include and execute the backend router
require_once $backendPath;
?>
