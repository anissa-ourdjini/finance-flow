<?php
// register.php (MySQL/WAMP)
header('Content-Type: application/json');

// Allow CORS for local dev (adjust for production)
header('Access-Control-Allow-Origin: *');
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
if(function_exists('ff_log')) ff_log(['register_request'=> $input]);

$prenom = trim($input['prenom'] ?? '');
$nom = trim($input['nom'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if (!$prenom || !$email || !$password) {
    http_response_code(422);
    echo json_encode(['error' => 'missing_fields']);
    exit;
}

require_once __DIR__ . '/config.php';

try{
    $pdo = ff_get_pdo();
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO utilisateur (prenom, nom, email, mot_de_passe) VALUES (:prenom, :nom, :email, :mot_de_passe)');
    $stmt->execute([
        ':prenom' => $prenom,
        ':nom' => $nom,
        ':email' => $email,
        ':mot_de_passe' => $hash
    ]);
    $id = $pdo->lastInsertId();
    echo json_encode(['ok' => true, 'id' => $id]);
}catch(PDOException $e){
    if(function_exists('ff_log')) ff_log(['register_error'=>$e->getMessage()]);
    if(stripos($e->getMessage(), '1062') !== false || stripos($e->getMessage(), 'duplicate') !== false){
        http_response_code(409);
        echo json_encode(['error' => 'email_taken']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'server_error', 'message' => $e->getMessage()]);
    }
}
