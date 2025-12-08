<?php
// login.php (MySQL/WAMP)
session_start();
header('Content-Type: application/json');
// Allow CORS for the requesting origin and support credentials (cookies)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid_json']);
    exit;
}

// log request for debugging
if(function_exists('ff_log')) ff_log(['login_request'=>$input]);

$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if (!$email || !$password) {
    http_response_code(422);
    echo json_encode(['error' => 'missing_fields']);
    exit;
}

require_once __DIR__ . '/config.php';
try {
    $pdo = ff_get_pdo();
    $stmt = $pdo->prepare('SELECT id, prenom, nom, email, mot_de_passe FROM utilisateur WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'message' => 'Utilisateur introuvable']);
        exit;
    }

    if (!password_verify($password, $user['mot_de_passe'])) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'message' => 'Mot de passe incorrect']);
        exit;
    }

    // login success
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];

    echo json_encode(['ok' => true, 'id' => $user['id'], 'prenom' => $user['prenom'], 'nom' => $user['nom']]);
} catch (PDOException $e) {
    if(function_exists('ff_log')) ff_log(['login_error'=>$e->getMessage()]);
    http_response_code(500);
    echo json_encode(['error' => 'server_error', 'message' => $e->getMessage()]);
}
