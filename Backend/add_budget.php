<?php
// add_budget.php
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
    $stmt = $pdo->prepare('INSERT INTO budget (utilisateur_id, categorie_id, montant_prevu, periode) VALUES (:uid, :cid, :montant, :periode)');
    $stmt->execute([
        ':uid' => $input['utilisateur_id'] ?? null,
        ':cid' => $input['categorie_id'] ?? null,
        ':montant' => $input['montant_prevu'] ?? 0,
        ':periode' => $input['periode'] ?? 'mensuel'
    ]);
    echo json_encode(['ok'=>true, 'id'=> (int)$pdo->lastInsertId()]);
} catch (Exception $e){ if(function_exists('ff_log')) ff_log(['add_budget_error'=>$e->getMessage()]); http_response_code(500); echo json_encode(['error'=>'server_error','message'=>$e->getMessage()]); }

?>
