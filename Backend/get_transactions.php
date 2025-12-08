<?php
// get_transactions.php
// Retourne les transactions pour l'utilisateur connecté (session) ou pour ?user_id=ID
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
session_start();

try{
    $pdo = ff_get_pdo();

    // determine user id: session or GET param
    $userId = null;
    if (!empty($_SESSION['user_id'])) {
        $userId = (int) $_SESSION['user_id'];
    } elseif (!empty($_GET['user_id'])) {
        $userId = (int) $_GET['user_id'];
    }

    // build query - if no userId, return latest 50 transactions globally
    if ($userId) {
    $sql = "SELECT t.id, t.date_transaction, t.lieu, t.titre, t.description, t.montant, t.type, sc.nom AS sous_categorie, c.nom AS categorie, t.utilisateur_id
        FROM transactions t
        LEFT JOIN sous_categorie sc ON t.sous_categorie_id = sc.id
        LEFT JOIN categorie c ON sc.categorie_id = c.id
        WHERE t.utilisateur_id = :uid
        ORDER BY t.date_transaction DESC, t.id DESC LIMIT 200";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':uid' => $userId]);
    } else {
    $sql = "SELECT t.id, t.date_transaction, t.lieu, t.titre, t.description, t.montant, t.type, sc.nom AS sous_categorie, c.nom AS categorie, t.utilisateur_id
        FROM transactions t
        LEFT JOIN sous_categorie sc ON t.sous_categorie_id = sc.id
        LEFT JOIN categorie c ON sc.categorie_id = c.id
        ORDER BY t.date_transaction DESC, t.id DESC LIMIT 50";
        $stmt = $pdo->query($sql);
    }

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $out = ['transactions' => [], 'count' => count($rows)];
    foreach($rows as $r){
        $out['transactions'][] = [
            'id' => (int)$r['id'],
            'titre' => $r['titre'],
            'montant' => (float)$r['montant'],
            'categorie' => $r['categorie'] ?? ($r['sous_categorie'] ?? null),
            'date_transaction' => $r['date_transaction'],
            'lieu' => $r['lieu'],
            'description' => $r['description'],
            'type' => $r['type'],
            'utilisateur_id' => (int)$r['utilisateur_id']
        ];
    }

    // Optional: try to compute a simple monthly income if budgets exist
    try{
        $incStmt = $pdo->prepare("SELECT SUM(montant_prevu) AS income_sum FROM budget b JOIN categorie c ON b.categorie_id = c.id WHERE b.utilisateur_id = :uid AND c.type = 'revenu' AND b.periode = 'mensuel'");
        if ($userId) {
            $incStmt->execute([':uid' => $userId]);
            $incRow = $incStmt->fetch(PDO::FETCH_ASSOC);
            if ($incRow && $incRow['income_sum'] !== null) {
                $out['income'] = (float)$incRow['income_sum'];
            }
        }
    } catch (Exception $e) {
        // ignore
    }

    echo json_encode($out, JSON_UNESCAPED_UNICODE);

} catch (Exception $e){
    if(function_exists('ff_log')) ff_log(['get_transactions_error' => $e->getMessage()]);
    http_response_code(500);
    echo json_encode(['error' => 'server_error', 'message' => $e->getMessage()]);
}

?>
