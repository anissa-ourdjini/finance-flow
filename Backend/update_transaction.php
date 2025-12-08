<?php
// update_transaction.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['id'])) { http_response_code(400); echo json_encode(['error'=>'invalid_json_or_missing_id']); exit; }

require_once __DIR__ . '/config.php';
try{
    $pdo = ff_get_pdo();
    $fields = [];
    $params = [':id' => (int)$input['id']];
    $cols = ['date_transaction','lieu','titre','description','montant','type','sous_categorie_id','utilisateur_id'];
    foreach($cols as $c){ if(array_key_exists($c, $input)){ $fields[] = "$c = :$c"; $params[":$c"] = $input[$c]; }}
    if(empty($fields)){ echo json_encode(['ok'=>true, 'updated'=>0]); exit; }
    $sql = 'UPDATE transactions SET ' . implode(',', $fields) . ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['ok'=>true, 'updated'=>$stmt->rowCount()]);
} catch (Exception $e){ if(function_exists('ff_log')) ff_log(['update_transaction_error'=>$e->getMessage()]); http_response_code(500); echo json_encode(['error'=>'server_error','message'=>$e->getMessage()]); }

?>
