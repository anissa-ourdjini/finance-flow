<?php
/**
 * FinanceFlow API Router
 * Point d'entrée centralisé pour toutes les requêtes API
 */

// Configuration des erreurs
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("[$errno] $errstr in $errfile:$errline");
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Erreur serveur']);
    exit;
});

try {
    // Démarrage session
    session_start();
    
    // Headers JSON et CORS
    header('Content-Type: application/json; charset=utf-8');
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
    } else {
        header('Access-Control-Allow-Origin: *');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

    // Gestion preflight OPTIONS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    // Chargement configuration
    require_once __DIR__ . '/config.php';

    // Parsing de la requête
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = preg_replace('#^/Backend(/router\.php)?/?#', '', $path);
    $path = trim($path, '/');
    
    // Parsing des segments de route
    $segments = $path ? explode('/', $path) : [];

    // Récupération des données POST/PUT/DELETE
    $input = null;
    if (in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'JSON invalide: ' . json_last_error_msg()]);
            exit;
        }
    }

    // Log de la requête
    if (function_exists('ff_log')) {
        ff_log(['method' => $method, 'path' => $path, 'segments' => $segments]);
    }

    // ==================== HELPERS ====================
    
    function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    function sendError($message, $statusCode = 400) {
        http_response_code($statusCode);
        echo json_encode(['error' => true, 'message' => $message]);
        exit;
    }

    function getCurrentUserId() {
        return $_SESSION['user_id'] ?? null;
    }

    function requireAuth() {
        $userId = getCurrentUserId();
        if (!$userId) {
            sendError('Authentification requise', 401);
        }
        return $userId;
    }

    // ==================== CONNEXION BASE ====================
    
    $pdo = ff_get_pdo();

    // ==================== ROUTES ====================
    
    $resource = $segments[0] ?? '';
    $action = $segments[1] ?? '';

    // ==================== AUTH ====================
    
    if ($resource === 'auth') {
        // POST /auth/login
        if ($action === 'login' && $method === 'POST') {
            $email = strtolower(trim($input['email'] ?? ''));
            $password = $input['password'] ?? '';
            
            if (!$email || !$password) {
                sendError('Email et mot de passe requis', 422);
            }
            
            $stmt = $pdo->prepare('SELECT id, prenom, nom, email, mot_de_passe FROM utilisateur WHERE email = :email LIMIT 1');
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || !password_verify($password, $user['mot_de_passe'])) {
                sendError('Email ou mot de passe incorrect', 401);
            }
            
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            
            sendResponse([
                'ok' => true,
                'user' => [
                    'id' => $user['id'],
                    'prenom' => $user['prenom'],
                    'nom' => $user['nom'],
                    'email' => $user['email']
                ]
            ]);
        }
        
        // POST /auth/register
        if ($action === 'register' && $method === 'POST') {
            $prenom = trim($input['prenom'] ?? '');
            $nom = trim($input['nom'] ?? '');
            $email = strtolower(trim($input['email'] ?? ''));
            $password = $input['password'] ?? '';
            
            if (!$prenom || !$email || !$password) {
                sendError('Prénom, email et mot de passe requis', 422);
            }
            
            $hash = password_hash($password, PASSWORD_DEFAULT);
            
            try {
                $stmt = $pdo->prepare('INSERT INTO utilisateur (prenom, nom, email, mot_de_passe) VALUES (:prenom, :nom, :email, :pass)');
                $stmt->execute([
                    ':prenom' => $prenom,
                    ':nom' => $nom,
                    ':email' => $email,
                    ':pass' => $hash
                ]);
                
                sendResponse(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
            } catch (PDOException $e) {
                if (stripos($e->getMessage(), '1062') !== false) {
                    sendError('Cet email est déjà utilisé', 409);
                }
                throw $e;
            }
        }
        
        // POST /auth/logout
        if ($action === 'logout' && $method === 'POST') {
            session_destroy();
            sendResponse(['ok' => true]);
        }
    }

    // ==================== TRANSACTIONS ====================
    
    if ($resource === 'transactions') {
        $userId = requireAuth();
        
        // GET /transactions
        if (empty($action) && $method === 'GET') {
            $sql = "SELECT t.id, t.date_transaction, t.lieu, t.titre, t.description, t.montant, t.type, 
                    t.sous_categorie_id, t.categorie_id,
                    sc.nom AS sous_categorie, c.nom AS categorie
                    FROM transactions t
                    LEFT JOIN sous_categorie sc ON t.sous_categorie_id = sc.id
                    LEFT JOIN categorie c ON sc.categorie_id = c.id
                    WHERE t.utilisateur_id = :uid
                    ORDER BY t.date_transaction DESC, t.id DESC 
                    LIMIT 500";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':uid' => $userId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $transactions = array_map(function($r) {
                return [
                    'id' => (int)$r['id'],
                    'titre' => $r['titre'],
                    'montant' => (float)$r['montant'],
                    'type' => $r['type'],
                    'date_transaction' => $r['date_transaction'],
                    'lieu' => $r['lieu'],
                    'description' => $r['description'],
                    'categorie' => $r['categorie'],
                    'sous_categorie' => $r['sous_categorie'],
                    'categorie_id' => (int)$r['categorie_id'],
                    'sous_categorie_id' => $r['sous_categorie_id'] ? (int)$r['sous_categorie_id'] : null
                ];
            }, $rows);
            
            sendResponse(['ok' => true, 'transactions' => $transactions]);
        }
        
        // POST /transactions
        if (empty($action) && $method === 'POST') {
            if (!isset($input['titre']) || !isset($input['montant']) || !isset($input['type'])) {
                sendError('Champs requis: titre, montant, type', 422);
            }
            
            $stmt = $pdo->prepare('INSERT INTO transactions (utilisateur_id, date_transaction, lieu, titre, description, montant, type, sous_categorie_id, categorie_id) 
                                   VALUES (:uid, :date, :lieu, :titre, :desc, :montant, :type, :scid, :cid)');
            $stmt->execute([
                ':uid' => $userId,
                ':date' => $input['date_transaction'] ?? date('Y-m-d'),
                ':lieu' => $input['lieu'] ?? null,
                ':titre' => $input['titre'],
                ':desc' => $input['description'] ?? null,
                ':montant' => (float)$input['montant'],
                ':type' => $input['type'],
                ':scid' => !empty($input['sous_categorie_id']) ? (int)$input['sous_categorie_id'] : null,
                ':cid' => !empty($input['categorie_id']) ? (int)$input['categorie_id'] : null
            ]);
            
            sendResponse(['ok' => true, 'id' => (int)$pdo->lastInsertId()], 201);
        }
        
        // PUT /transactions/:id
        if (is_numeric($action) && $method === 'PUT') {
            $id = (int)$action;
            
            // Vérification propriété
            $checkStmt = $pdo->prepare('SELECT utilisateur_id FROM transactions WHERE id = :id');
            $checkStmt->execute([':id' => $id]);
            $tx = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$tx || $tx['utilisateur_id'] != $userId) {
                sendError('Transaction introuvable ou non autorisée', 403);
            }
            
            $fields = [];
            $params = [':id' => $id];
            $cols = ['date_transaction', 'lieu', 'titre', 'description', 'montant', 'type', 'sous_categorie_id', 'categorie_id'];
            
            foreach ($cols as $c) {
                if (array_key_exists($c, $input)) {
                    $fields[] = "$c = :$c";
                    if ($c === 'montant') {
                        $params[":$c"] = (float)$input[$c];
                    } elseif (in_array($c, ['sous_categorie_id', 'categorie_id'])) {
                        $params[":$c"] = !empty($input[$c]) ? (int)$input[$c] : null;
                    } else {
                        $params[":$c"] = $input[$c];
                    }
                }
            }
            
            if (empty($fields)) {
                sendResponse(['ok' => true, 'updated' => 0]);
            }
            
            $fields[] = 'modifie_le = NOW()';
            $sql = 'UPDATE transactions SET ' . implode(', ', $fields) . ' WHERE id = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            sendResponse(['ok' => true, 'updated' => $stmt->rowCount()]);
        }
        
        // DELETE /transactions/:id
        if (is_numeric($action) && $method === 'DELETE') {
            $id = (int)$action;
            
            // Vérification propriété
            $checkStmt = $pdo->prepare('SELECT utilisateur_id FROM transactions WHERE id = :id');
            $checkStmt->execute([':id' => $id]);
            $tx = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$tx || $tx['utilisateur_id'] != $userId) {
                sendError('Transaction introuvable ou non autorisée', 403);
            }
            
            $stmt = $pdo->prepare('DELETE FROM transactions WHERE id = :id');
            $stmt->execute([':id' => $id]);
            
            sendResponse(['ok' => true, 'deleted' => $stmt->rowCount()]);
        }
    }

    // ==================== CATEGORIES ====================
    
    if ($resource === 'categories') {
        // GET /categories
        if ($method === 'GET') {
            $stmt = $pdo->query('SELECT id, nom, type, couleur, icone, description FROM categorie ORDER BY type, nom');
            $categories = [];
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $categories[] = [
                    'id' => (int)$row['id'],
                    'nom' => $row['nom'],
                    'type' => $row['type'],
                    'couleur' => $row['couleur'],
                    'icone' => $row['icone'],
                    'description' => $row['description']
                ];
            }
            
            sendResponse(['ok' => true, 'categories' => $categories]);
        }
    }

    // ==================== BUDGETS ====================
    
    if ($resource === 'budgets') {
        $userId = requireAuth();
        
        // GET /budgets
        if (empty($action) && $method === 'GET') {
            $stmt = $pdo->prepare('SELECT b.*, c.nom AS categorie_nom FROM budget b 
                                   LEFT JOIN categorie c ON b.categorie_id = c.id 
                                   WHERE b.utilisateur_id = :uid 
                                   ORDER BY b.annee DESC, b.mois DESC, b.id DESC');
            $stmt->execute([':uid' => $userId]);
            
            $budgets = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $budgets[] = [
                    'id' => (int)$row['id'],
                    'categorie_id' => (int)$row['categorie_id'],
                    'sous_categorie_id' => $row['sous_categorie_id'] ? (int)$row['sous_categorie_id'] : null,
                    'categorie_nom' => $row['categorie_nom'],
                    'montant_prevu' => (float)$row['montant_prevu'],
                    'montant_utilise' => (float)$row['montant_utilise'],
                    'periode' => $row['periode'],
                    'annee' => (int)$row['annee'],
                    'mois' => $row['mois'] ? (int)$row['mois'] : null
                ];
            }
            
            sendResponse(['ok' => true, 'budgets' => $budgets]);
        }
        
        // POST /budgets
        if (empty($action) && $method === 'POST') {
            if (!isset($input['montant_prevu']) || !isset($input['periode'])) {
                sendError('Champs requis: montant_prevu, periode', 422);
            }
            
            $stmt = $pdo->prepare('INSERT INTO budget (utilisateur_id, categorie_id, sous_categorie_id, montant_prevu, periode, annee, mois)
                                   VALUES (:uid, :cid, :scid, :montant, :periode, :annee, :mois)');
            $stmt->execute([
                ':uid' => $userId,
                ':cid' => !empty($input['categorie_id']) ? (int)$input['categorie_id'] : null,
                ':scid' => !empty($input['sous_categorie_id']) ? (int)$input['sous_categorie_id'] : null,
                ':montant' => (float)$input['montant_prevu'],
                ':periode' => $input['periode'],
                ':annee' => (int)($input['annee'] ?? date('Y')),
                ':mois' => !empty($input['mois']) ? (int)$input['mois'] : null
            ]);
            
            sendResponse(['ok' => true, 'id' => (int)$pdo->lastInsertId()], 201);
        }
        
        // PUT /budgets/:id
        if (is_numeric($action) && $method === 'PUT') {
            $id = (int)$action;
            
            // Vérification propriété
            $checkStmt = $pdo->prepare('SELECT utilisateur_id FROM budget WHERE id = :id');
            $checkStmt->execute([':id' => $id]);
            $budget = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$budget || $budget['utilisateur_id'] != $userId) {
                sendError('Budget introuvable ou non autorisé', 403);
            }
            
            $fields = [];
            $params = [':id' => $id];
            $cols = ['categorie_id', 'sous_categorie_id', 'montant_prevu', 'montant_utilise', 'periode', 'annee', 'mois'];
            
            foreach ($cols as $c) {
                if (array_key_exists($c, $input)) {
                    $fields[] = "$c = :$c";
                    if (in_array($c, ['montant_prevu', 'montant_utilise'])) {
                        $params[":$c"] = (float)$input[$c];
                    } elseif (in_array($c, ['categorie_id', 'sous_categorie_id', 'annee', 'mois'])) {
                        $params[":$c"] = !empty($input[$c]) ? (int)$input[$c] : null;
                    } else {
                        $params[":$c"] = $input[$c];
                    }
                }
            }
            
            if (empty($fields)) {
                sendResponse(['ok' => true, 'updated' => 0]);
            }
            
            $fields[] = 'modifie_le = NOW()';
            $sql = 'UPDATE budget SET ' . implode(', ', $fields) . ' WHERE id = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            sendResponse(['ok' => true, 'updated' => $stmt->rowCount()]);
        }
        
        // DELETE /budgets/:id
        if (is_numeric($action) && $method === 'DELETE') {
            $id = (int)$action;
            
            // Vérification propriété
            $checkStmt = $pdo->prepare('SELECT utilisateur_id FROM budget WHERE id = :id');
            $checkStmt->execute([':id' => $id]);
            $budget = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$budget || $budget['utilisateur_id'] != $userId) {
                sendError('Budget introuvable ou non autorisé', 403);
            }
            
            $stmt = $pdo->prepare('DELETE FROM budget WHERE id = :id');
            $stmt->execute([':id' => $id]);
            
            sendResponse(['ok' => true, 'deleted' => $stmt->rowCount()]);
        }
    }

    // ==================== 404 ====================
    
    sendError('Route non trouvée: ' . $path, 404);

} catch (PDOException $e) {
    if (function_exists('ff_log')) ff_log(['error' => 'PDO: ' . $e->getMessage()]);
    sendError('Erreur base de données', 500);
} catch (Exception $e) {
    if (function_exists('ff_log')) ff_log(['error' => 'Exception: ' . $e->getMessage()]);
    sendError('Erreur serveur', 500);
}
