<?php
/**
 * FinanceFlow API Router - Version simplifiée et stable
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Headers CORS et JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Démarrer la session
session_start();

try {
    // Configuration et helpers
    require_once __DIR__ . '/config.php';
    
    // Parser la requête
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = preg_replace('#.*/router\.php/?#', '', $path);
    $path = trim($path, '/');
    $segments = $path ? explode('/', $path) : [];
    
    // Récupérer le JSON input
    $input = null;
    if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
        $input = json_decode(file_get_contents('php://input'), true);
    }
    
    // Récupérer la ressource et l'action
    $resource = $segments[0] ?? '';
    $action = $segments[1] ?? '';
    
    // Connexion PDO
    $pdo = ff_get_pdo();
    
    // ===== AUTHENTIFICATION =====
    if ($resource === 'auth') {
        if ($action === 'login' && $method === 'POST') {
            $email = strtolower(trim($input['email'] ?? ''));
            $pwd = $input['password'] ?? '';
            
            if (!$email || !$pwd) {
                http_response_code(422);
                echo json_encode(['error' => true, 'message' => 'Email et mot de passe requis']);
                exit;
            }
            
            $stmt = $pdo->prepare('SELECT id, prenom, nom, email, mot_de_passe FROM utilisateur WHERE email = ?');
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || !password_verify($pwd, $user['mot_de_passe'])) {
                http_response_code(401);
                echo json_encode(['error' => true, 'message' => 'Email ou mot de passe incorrect']);
                exit;
            }
            
            $_SESSION['user_id'] = $user['id'];
            
            http_response_code(200);
            echo json_encode([
                'ok' => true,
                'user' => [
                    'id' => (int)$user['id'],
                    'prenom' => $user['prenom'],
                    'nom' => $user['nom'],
                    'email' => $user['email']
                ]
            ]);
            exit;
        }
        
        if ($action === 'register' && $method === 'POST') {
            $prenom = trim($input['prenom'] ?? '');
            $nom = trim($input['nom'] ?? '');
            $email = strtolower(trim($input['email'] ?? ''));
            $pwd = $input['password'] ?? '';
            
            if (!$prenom || !$email || !$pwd) {
                http_response_code(422);
                echo json_encode(['error' => true, 'message' => 'Champs requis manquants']);
                exit;
            }
            
            try {
                $stmt = $pdo->prepare('INSERT INTO utilisateur (prenom, nom, email, mot_de_passe) VALUES (?, ?, ?, ?)');
                $stmt->execute([$prenom, $nom, $email, password_hash($pwd, PASSWORD_DEFAULT)]);
                
                http_response_code(201);
                echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
            } catch (PDOException $e) {
                if (strpos($e->getMessage(), '1062') !== false) {
                    http_response_code(409);
                    echo json_encode(['error' => true, 'message' => 'Email déjà utilisé']);
                } else {
                    throw $e;
                }
            }
            exit;
        }
    }
    
    // Vérifier l'authentification pour les autres routes
    if (!isset($_SESSION['user_id']) && $resource !== 'categories') {
        http_response_code(401);
        echo json_encode(['error' => true, 'message' => 'Non authentifié']);
        exit;
    }
    
    $userId = $_SESSION['user_id'] ?? null;
    
    // ===== TRANSACTIONS =====
    if ($resource === 'transactions') {
        if (empty($action) && $method === 'GET') {
            $stmt = $pdo->prepare('
                SELECT t.id, t.titre, t.montant, t.type, t.date_transaction, t.lieu, t.description,
                       t.categorie_id, c.nom AS categorie
                FROM transactions t
                LEFT JOIN categorie c ON t.categorie_id = c.id
                WHERE t.utilisateur_id = ?
                ORDER BY t.date_transaction DESC
                LIMIT 500
            ');
            $stmt->execute([$userId]);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode(['ok' => true, 'transactions' => $transactions]);
            exit;
        }
        
        if (empty($action) && $method === 'POST') {
            $stmt = $pdo->prepare('
                INSERT INTO transactions (utilisateur_id, titre, montant, type, date_transaction, categorie_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $userId,
                $input['titre'] ?? '',
                $input['montant'] ?? 0,
                $input['type'] ?? 'depense',
                $input['date_transaction'] ?? date('Y-m-d'),
                $input['categorie_id'] ?? null
            ]);
            
            http_response_code(201);
            echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
            exit;
        }
        
        if (is_numeric($action) && $method === 'DELETE') {
            $stmt = $pdo->prepare('DELETE FROM transactions WHERE id = ? AND utilisateur_id = ?');
            $stmt->execute([(int)$action, $userId]);
            
            http_response_code(200);
            echo json_encode(['ok' => true, 'deleted' => $stmt->rowCount()]);
            exit;
        }
    }
    
    // ===== BUDGETS =====
    if ($resource === 'budgets') {
        if (empty($action) && $method === 'GET') {
            $stmt = $pdo->prepare('
                SELECT b.*, c.nom AS categorie_nom
                FROM budget b
                LEFT JOIN categorie c ON b.categorie_id = c.id
                WHERE b.utilisateur_id = ?
                ORDER BY b.annee DESC, b.mois DESC
            ');
            $stmt->execute([$userId]);
            $budgets = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode(['ok' => true, 'budgets' => $budgets]);
            exit;
        }
        
        if (empty($action) && $method === 'POST') {
            $stmt = $pdo->prepare('
                INSERT INTO budget (utilisateur_id, categorie_id, montant_prevu, periode, annee, mois)
                VALUES (?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $userId,
                $input['categorie_id'] ?? null,
                $input['montant_prevu'] ?? 0,
                $input['periode'] ?? 'mensuel',
                $input['annee'] ?? date('Y'),
                $input['mois'] ?? null
            ]);
            
            http_response_code(201);
            echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
            exit;
        }
    }
    
    // ===== CATEGORIES =====
    if ($resource === 'categories' && $method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM categorie ORDER BY type, nom');
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode(['ok' => true, 'categories' => $categories]);
        exit;
    }
    
    // 404
    http_response_code(404);
    echo json_encode(['error' => true, 'message' => 'Route non trouvée']);
    
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Erreur serveur']);
}
