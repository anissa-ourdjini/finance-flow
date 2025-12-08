<?php
// get_budgets.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/config.php';
try{
    $pdo = ff_get_pdo();
    $userId = !empty($_GET['user_id']) ? (int)$_GET['user_id'] : null;
    if($userId){
        $stmt = $pdo->prepare('SELECT b.id, b.montant_prevu, b.periode, b.categorie_id, c.nom as categorie FROM budget b LEFT JOIN categorie c ON b.categorie_id = c.id WHERE b.utilisateur_id = :uid');
        $stmt->execute([':uid' => $userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $rows = [];
    }
    echo json_encode(['ok'=>true, 'budgets'=>$rows]);
} catch (Exception $e){ if(function_exists('ff_log')) ff_log(['get_budgets_error'=>$e->getMessage()]); http_response_code(500); echo json_encode(['error'=>'server_error','message'=>$e->getMessage()]); }

?>
