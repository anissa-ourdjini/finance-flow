<?php
/**
 * Backend Router - API FinanceFlow
 * Routes REST pour authentification, transactions, budgets, catégories
 * Codé de manière propre et cohérente
 */

// Démarrer la session AVANT les headers
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

// ============================================================
// Fonctions utilitaires
// ============================================================

function parseRequestPath() {
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($uri, PHP_URL_PATH) ?? '/';
    
    // Enlever basePath WAMP
    $basePath = '/FinanceFlow';
    if (strpos($path, $basePath) === 0) {
        $path = substr($path, strlen($basePath));
    }
    
    // Enlever préfixes Backend ou api
    $path = preg_replace('#^/(Backend|api)#', '', $path);
    
    // S'assurer que ça commence par /
    return (strpos($path, '/') === 0) ? $path : '/' . $path;
}

function sendJson($ok, $data = [], $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode(array_merge(['ok' => $ok], $data));
    exit;
}

function requireAuth() {
    if (!isset($_SESSION['user'])) {
        sendJson(false, ['error' => 'Unauthorized'], 401);
    }
}

// Parser la requête
$requestPath = parseRequestPath();
$method = $_SERVER['REQUEST_METHOD'];

// Parser le JSON du body
$data = null;
if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
    $input = file_get_contents('php://input');
    if (!empty($input)) {
        $data = json_decode($input, true);
    }
}

// Connexion DB
try {
    $pdo = ff_get_pdo();
} catch (Exception $e) {
    sendJson(false, ['error' => 'Database connection failed'], 500);
}

// ============================================================
// AUTHENTIFICATION
// ============================================================

if ($requestPath === '/auth/register' && $method === 'POST') {
    $prenom = $data['prenom'] ?? null;
    $nom = $data['nom'] ?? null;
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if (!$prenom || !$nom || !$email || !$password) {
        sendJson(false, ['error' => 'Missing required fields'], 400);
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare('INSERT INTO utilisateur (prenom, nom, email, mot_de_passe) VALUES (:p, :n, :e, :pw)');
        $stmt->execute([':p' => $prenom, ':n' => $nom, ':e' => $email, ':pw' => $hashedPassword]);
        sendJson(true, ['id' => $pdo->lastInsertId(), 'message' => 'User registered'], 201);
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate') !== false) {
            sendJson(false, ['error' => 'Email already exists'], 409);
        }
        sendJson(false, ['error' => 'Registration failed'], 500);
    }
}

if ($requestPath === '/auth/login' && $method === 'POST') {
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if (!$email || !$password) {
        sendJson(false, ['error' => 'Missing email or password'], 400);
    }

    try {
        $stmt = $pdo->prepare('SELECT id, prenom, nom, email, mot_de_passe FROM utilisateur WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['mot_de_passe'])) {
            sendJson(false, ['error' => 'Invalid credentials'], 401);
        }

        $_SESSION['user'] = [
            'id' => $user['id'],
            'prenom' => $user['prenom'],
            'nom' => $user['nom'],
            'email' => $user['email']
        ];

        sendJson(true, ['user' => $_SESSION['user']]);
    } catch (PDOException $e) {
        sendJson(false, ['error' => 'Login failed'], 500);
    }
}

if ($requestPath === '/auth/logout' && $method === 'POST') {
    session_destroy();
    sendJson(true, ['message' => 'Logged out']);
}

// ============================================================
// CATÉGORIES
// ============================================================

if ($requestPath === '/categories' && $method === 'GET') {
    try {
        $stmt = $pdo->query('SELECT id, nom, type, couleur, icone, description FROM categorie ORDER BY nom');
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendJson(true, ['categories' => $categories]);
    } catch (PDOException $e) {
        sendJson(false, ['error' => 'Failed to fetch categories'], 500);
    }
}

// ============================================================
// TRANSACTIONS
// ============================================================

if ($requestPath === '/transactions' && $method === 'GET') {
    requireAuth();
    $userId = $_SESSION['user']['id'];

    try {
        $stmt = $pdo->prepare('SELECT id, date_transaction, titre, montant, type, lieu, description, sous_categorie_id, categorie_id FROM transactions WHERE utilisateur_id = :uid ORDER BY date_transaction DESC');
        $stmt->execute([':uid' => $userId]);
        sendJson(true, ['transactions' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        sendJson(false, ['error' => 'Failed to fetch transactions'], 500);
    }
}

if ($requestPath === '/transactions' && $method === 'POST') {
    requireAuth();
    $userId = $_SESSION['user']['id'];
    
    if (!($data['titre'] ?? false) || !($data['montant'] ?? false) || !($data['type'] ?? false)) {
        sendJson(false, ['error' => 'Missing required fields'], 400);
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO transactions (utilisateur_id, date_transaction, titre, montant, type, lieu, description, sous_categorie_id, categorie_id) VALUES (:uid, :date, :titre, :montant, :type, :lieu, :desc, :scid, :cid)');
        $stmt->execute([
            ':uid' => $userId,
            ':date' => $data['date_transaction'] ?? date('Y-m-d'),
            ':titre' => $data['titre'],
            ':montant' => $data['montant'],
            ':type' => $data['type'],
            ':lieu' => $data['lieu'] ?? null,
            ':desc' => $data['description'] ?? null,
            ':scid' => $data['sous_categorie_id'] ?? null,
            ':cid' => $data['categorie_id'] ?? null
        ]);
        sendJson(true, ['id' => $pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        sendJson(false, ['error' => 'Failed to create transaction'], 500);
    }
}

if (preg_match('/^\/transactions\/(\d+)$/', $requestPath, $matches) && $method === 'PUT') {
    requireAuth();
    $transactionId = (int)$matches[1];
    $userId = $_SESSION['user']['id'];

    try {
        $check = $pdo->prepare('SELECT id FROM transactions WHERE id = :id AND utilisateur_id = :uid');
        $check->execute([':id' => $transactionId, ':uid' => $userId]);
        if (!$check->fetch()) {
            sendJson(false, ['error' => 'Forbidden'], 403);
        }

        $fields = ['titre', 'montant', 'type', 'date_transaction', 'lieu', 'description', 'categorie_id', 'sous_categorie_id'];
        $updates = [];
        $params = [':id' => $transactionId];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($updates)) {
            sendJson(false, ['error' => 'Nothing to update'], 400);
        }

        $updates[] = 'modifie_le = CURRENT_TIMESTAMP';
        $sql = 'UPDATE transactions SET ' . implode(', ', $updates) . ' WHERE id = :id';
        $pdo->prepare($sql)->execute($params);
        sendJson(true, ['updated' => 1]);
    } catch (PDOException $e) {
        sendJson(false, ['error' => 'Failed to update transaction'], 500);
    }
}

if (preg_match('/^\/transactions\/(\d+)$/', $requestPath, $matches) && $method === 'DELETE') {
    requireAuth();
    $transactionId = (int)$matches[1];
    $userId = $_SESSION['user']['id'];

    try {
        $check = $pdo->prepare('SELECT id FROM transactions WHERE id = :id AND utilisateur_id = :uid');
        $check->execute([':id' => $transactionId, ':uid' => $userId]);
        if (!$check->fetch()) {
            sendJson(false, ['error' => 'Forbidden'], 403);
        }

        $pdo->prepare('DELETE FROM transactions WHERE id = :id')->execute([':id' => $transactionId]);
        sendJson(true, ['deleted' => 1]);
    } catch (PDOException $e) {
        sendJson(false, ['error' => 'Failed to delete transaction'], 500);
    }
}

// ============================================================
// BUDGETS
// ============================================================

if ($requestPath === '/budgets' && $method === 'GET') {
    requireAuth();
    $userId = $_SESSION['user']['id'];

    try {
        $sql = 'SELECT b.id, b.categorie_id, b.sous_categorie_id, c.nom as categorie_nom, sc.nom as sous_categorie_nom, b.montant_prevu, b.montant_utilise, b.periode, b.annee, b.mois FROM budget b LEFT JOIN categorie c ON b.categorie_id = c.id LEFT JOIN sous_categorie sc ON b.sous_categorie_id = sc.id WHERE b.utilisateur_id = :uid ORDER BY b.annee DESC, b.mois DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':uid' => $userId]);
        sendJson(true, ['budgets' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        sendJson(false, ['error' => 'Failed to fetch budgets'], 500);
    }
}

if ($requestPath === '/budgets' && $method === 'POST') {
    requireAuth();
    $userId = $_SESSION['user']['id'];

    if (!($data['montant_prevu'] ?? false)) {
        sendJson(false, ['error' => 'Missing montant_prevu'], 400);
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO budget (utilisateur_id, categorie_id, sous_categorie_id, montant_prevu, montant_utilise, periode, annee, mois) VALUES (:uid, :cid, :scid, :mp, 0, :per, :an, :mo)');
        $stmt->execute([
            ':uid' => $userId,
            ':cid' => $data['categorie_id'] ?? null,
            ':scid' => $data['sous_categorie_id'] ?? null,
            ':mp' => $data['montant_prevu'],
            ':per' => $data['periode'] ?? 'mensuel',
            ':an' => $data['annee'] ?? date('Y'),
            ':mo' => $data['mois'] ?? date('m')
        ]);
        sendJson(true, ['id' => $pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        sendJson(false, ['error' => 'Failed to create budget'], 500);
    }
}

if (preg_match('/^\/budgets\/(\d+)$/', $requestPath, $matches) && $method === 'PUT') {
    requireAuth();
    $budgetId = (int)$matches[1];
    $userId = $_SESSION['user']['id'];

    try {
        $check = $pdo->prepare('SELECT id FROM budget WHERE id = :id AND utilisateur_id = :uid');
        $check->execute([':id' => $budgetId, ':uid' => $userId]);
        if (!$check->fetch()) {
            sendJson(false, ['error' => 'Forbidden'], 403);
        }

        $updates = [];
        $params = [':id' => $budgetId];
        
        if (isset($data['montant_prevu'])) {
            $updates[] = 'montant_prevu = :mp';
            $params[':mp'] = $data['montant_prevu'];
        }
        if (isset($data['montant_utilise'])) {
            $updates[] = 'montant_utilise = :mu';
            $params[':mu'] = $data['montant_utilise'];
        }

        if (empty($updates)) {
            sendJson(false, ['error' => 'Nothing to update'], 400);
        }

        $updates[] = 'modifie_le = CURRENT_TIMESTAMP';
        $sql = 'UPDATE budget SET ' . implode(', ', $updates) . ' WHERE id = :id';
        $pdo->prepare($sql)->execute($params);
        sendJson(true, ['updated' => 1]);
    } catch (PDOException $e) {
        sendJson(false, ['error' => 'Failed to update budget'], 500);
    }
}

if (preg_match('/^\/budgets\/(\d+)$/', $requestPath, $matches) && $method === 'DELETE') {
    requireAuth();
    $budgetId = (int)$matches[1];
    $userId = $_SESSION['user']['id'];

    try {
        $check = $pdo->prepare('SELECT id FROM budget WHERE id = :id AND utilisateur_id = :uid');
        $check->execute([':id' => $budgetId, ':uid' => $userId]);
        if (!$check->fetch()) {
            sendJson(false, ['error' => 'Forbidden'], 403);
        }

        $pdo->prepare('DELETE FROM budget WHERE id = :id')->execute([':id' => $budgetId]);
        sendJson(true, ['deleted' => 1]);
    } catch (PDOException $e) {
        sendJson(false, ['error' => 'Failed to delete budget'], 500);
    }
}

// ============================================================
// 404 - Route not found
// ============================================================

sendJson(false, ['error' => 'Not found', 'path' => $requestPath, 'method' => $method], 404);
?>
