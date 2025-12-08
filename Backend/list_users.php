<?php
// list_users.php - debug helper to list rows from `utilisateur`
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';
try{
    $pdo = ff_get_pdo();
    $out = ['ok'=>true];
    // check tables existence
    $tables = ['utilisateur','categorie','sous_categorie','transactions','partage_transactions','budget'];
    $existing = [];
    foreach($tables as $t){
        try{
            $r = $pdo->query("SELECT 1 FROM $t LIMIT 1");
            $existing[$t] = true;
        } catch (Exception $e){
            $existing[$t] = false;
        }
    }
    $out['tables'] = $existing;

    // users
    try{
        $stmt = $pdo->query('SELECT id, prenom, nom, email, date_inscription FROM utilisateur ORDER BY id DESC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $out['users_count'] = count($rows);
        $out['users'] = $rows;
    } catch (Exception $e){
        $out['users_count'] = 0;
        $out['users'] = [];
        $out['users_error'] = $e->getMessage();
    }

    // transactions info
    try{
        $tstmt = $pdo->query('SELECT COUNT(*) AS c FROM transactions');
        $trow = $tstmt->fetch(PDO::FETCH_ASSOC);
        $out['transactions_count'] = (int)($trow['c'] ?? 0);
        $uidStmt = $pdo->query('SELECT DISTINCT utilisateur_id FROM transactions');
        $uids = $uidStmt->fetchAll(PDO::FETCH_COLUMN);
        $out['transactions_user_ids'] = $uids;
    } catch (Exception $e){
        $out['transactions_count'] = 0;
        $out['transactions_error'] = $e->getMessage();
    }

    echo json_encode($out, JSON_UNESCAPED_UNICODE);
} catch (Exception $e){
    http_response_code(500);
    echo json_encode(['ok'=>false, 'error'=>$e->getMessage()]);
}

?>
