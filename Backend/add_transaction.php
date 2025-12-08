<?php
// add_transaction.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { http_response_code(400); echo json_encode(['error'=>'invalid_json']); exit; }

require_once __DIR__ . '/config.php';
try{
    $pdo = ff_get_pdo();
    $stmt = $pdo->prepare('INSERT INTO transactions (date_transaction, lieu, titre, description, montant, type, sous_categorie_id, utilisateur_id) VALUES (:date, :lieu, :titre, :description, :montant, :type, :scid, :uid)');
    $stmt->execute([
        ':date' => $input['date_transaction'] ?? date('Y-m-d H:i:s'),
        ':lieu' => $input['lieu'] ?? null,
        ':titre' => $input['titre'] ?? null,
        ':description' => $input['description'] ?? null,
        ':montant' => $input['montant'] ?? 0,
        ':type' => $input['type'] ?? 'depense',
        ':scid' => $input['sous_categorie_id'] ?? null,
        ':uid' => $input['utilisateur_id'] ?? null
    ]);
    $id = (int)$pdo->lastInsertId();
    echo json_encode(['ok'=>true, 'id'=>$id]);
} catch (Exception $e){ if(function_exists('ff_log')) ff_log(['add_transaction_error'=>$e->getMessage()]); http_response_code(500); echo json_encode(['error'=>'server_error','message'=>$e->getMessage()]); }

?>
