<?php
// seed_test_data.php -- insert a test user, categories and some transactions if not present
require_once __DIR__ . '/config.php';
try{
    $pdo = ff_get_pdo();

    // create test user if not exists
    $email = 'test@example.com';
    $stmt = $pdo->prepare('SELECT id FROM utilisateur WHERE email = :email LIMIT 1');
    $stmt->execute([':email'=>$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if(!$user){
        $hash = password_hash('password', PASSWORD_DEFAULT);
        $ins = $pdo->prepare('INSERT INTO utilisateur (prenom, nom, email, mot_de_passe) VALUES (:p,:n,:e,:pw)');
        $ins->execute([':p'=>'Test',':n'=>'User',':e'=>$email,':pw'=>$hash]);
        $userId = $pdo->lastInsertId();
        echo "Created user id $userId\n";
    } else {
        $userId = $user['id'];
        echo "User exists id $userId\n";
    }

    // ensure some categories
    $cats = ['Snacks'=>'#ffd6d6','Games'=>'#cbe4ff','Plushies'=>'#fff1c6','Boba'=>'#f7d6f0'];
    foreach($cats as $name=>$color){
        $s = $pdo->prepare('SELECT id FROM categorie WHERE nom = :nom LIMIT 1');
        $s->execute([':nom'=>$name]);
        if(!$s->fetch()){
            $i = $pdo->prepare('INSERT INTO categorie (nom, type, couleur) VALUES (:nom, :type, :color)');
            $i->execute([':nom'=>$name, ':type'=>'depense', ':color'=>$color]);
            echo "Inserted category $name\n";
        }
    }

    // ensure a sous_categorie for Boba etc (use category ids)
    $catStmt = $pdo->query('SELECT id, nom FROM categorie');
    $catMap = [];
    while($r = $catStmt->fetch(PDO::FETCH_ASSOC)) $catMap[$r['nom']] = $r['id'];

    foreach(array_keys($cats) as $name){
        $cid = $catMap[$name] ?? null;
        if($cid){
            $s = $pdo->prepare('SELECT id FROM sous_categorie WHERE nom = :nom AND categorie_id = :cid LIMIT 1');
            $s->execute([':nom'=>$name, ':cid'=>$cid]);
            if(!$s->fetch()){
                $i = $pdo->prepare('INSERT INTO sous_categorie (nom, categorie_id) VALUES (:nom, :cid)');
                $i->execute([':nom'=>$name, ':cid'=>$cid]);
                echo "Inserted sous_categorie $name\n";
            }
        }
    }

    // insert a few transactions for user
    $subStmt = $pdo->query('SELECT id, nom FROM sous_categorie');
    $subs = [];
    while($r = $subStmt->fetch(PDO::FETCH_ASSOC)) $subs[$r['nom']] = $r['id'];

    $now = date('Y-m-d');
    $txs = [
        ['titre'=>'Bubble tea','montant'=>8.00,'nom'=>'Boba'],
        ['titre'=>'Candy','montant'=>12.00,'nom'=>'Snacks'],
        ['titre'=>'Game','montant'=>40.00,'nom'=>'Games']
    ];
    foreach($txs as $t){
        $scid = $subs[$t['nom']] ?? null;
        if($scid){
            // avoid duplicates: check similar title and user
            $q = $pdo->prepare('SELECT id FROM transactions WHERE titre = :titre AND utilisateur_id = :uid LIMIT 1');
            $q->execute([':titre'=>$t['titre'], ':uid'=>$userId]);
            if(!$q->fetch()){
                $ins = $pdo->prepare('INSERT INTO transactions (date_transaction, lieu, titre, description, montant, type, sous_categorie_id, utilisateur_id) VALUES (:date, :lieu, :titre, :desc, :montant, :type, :scid, :uid)');
                $ins->execute([':date'=>$now, ':lieu'=>null, ':titre'=>$t['titre'], ':desc'=>null, ':montant'=>$t['montant'], ':type'=>'depense', ':scid'=>$scid, ':uid'=>$userId]);
                echo "Inserted tx {$t['titre']}\n";
            }
        }
    }

    echo "Seeding finished.\n";

} catch (Exception $e){
    echo "Error: " . $e->getMessage() . "\n";
    if(function_exists('ff_log')) ff_log(['seed_error'=>$e->getMessage()]);
}

?>
