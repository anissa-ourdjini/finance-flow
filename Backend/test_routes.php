<?php
/**
 * Script de test des routes de l'API
 * Usage: php test_routes.php
 */

echo "=== Test des routes FinanceFlow API ===\n\n";

$baseUrl = 'http://127.0.0.1:8000/Backend';

// Test 1: GET /categories (pas besoin d'auth)
echo "Test 1: GET /categories\n";
$response = file_get_contents($baseUrl . '/categories');
$data = json_decode($response, true);
echo "✓ Statut: " . (isset($data['ok']) && $data['ok'] ? "OK" : "ERREUR") . "\n";
echo "✓ Catégories trouvées: " . (isset($data['categories']) ? count($data['categories']) : 0) . "\n\n";

// Test 2: POST /auth/register (création d'un utilisateur de test)
echo "Test 2: POST /auth/register\n";
$testEmail = 'test_' . time() . '@test.com';
$registerData = [
    'prenom' => 'Test',
    'nom' => 'User',
    'email' => $testEmail,
    'password' => 'test123'
];

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($registerData)
    ]
]);

$response = @file_get_contents($baseUrl . '/auth/register', false, $context);
$data = json_decode($response, true);
echo "✓ Statut: " . (isset($data['ok']) && $data['ok'] ? "OK" : "ERREUR") . "\n";
if (isset($data['id'])) {
    echo "✓ User ID créé: " . $data['id'] . "\n";
}
echo "\n";

// Test 3: POST /auth/login
echo "Test 3: POST /auth/login\n";
$loginData = [
    'email' => $testEmail,
    'password' => 'test123'
];

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($loginData)
    ]
]);

$response = @file_get_contents($baseUrl . '/auth/login', false, $context);
$data = json_decode($response, true);
echo "✓ Statut: " . (isset($data['ok']) && $data['ok'] ? "OK" : "ERREUR") . "\n";
if (isset($data['user'])) {
    echo "✓ User connecté: " . $data['user']['prenom'] . " " . $data['user']['nom'] . "\n";
}
echo "\n";

echo "=== Tests terminés ===\n";
echo "\nRoutes disponibles:\n";
echo "- POST   /api/auth/login\n";
echo "- POST   /api/auth/register\n";
echo "- POST   /api/auth/logout\n";
echo "- GET    /api/transactions\n";
echo "- POST   /api/transactions\n";
echo "- PUT    /api/transactions/:id\n";
echo "- DELETE /api/transactions/:id\n";
echo "- GET    /api/categories\n";
echo "- GET    /api/budgets\n";
echo "- POST   /api/budgets\n";
echo "- PUT    /api/budgets/:id\n";
echo "- DELETE /api/budgets/:id\n";
