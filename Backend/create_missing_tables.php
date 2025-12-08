<?php
// create_missing_tables.php -- create transactions and partage_transactions tables if missing
require_once __DIR__ . '/config.php';
try{
    $pdo = ff_get_pdo();

    $sql1 = "CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_transaction DATE NOT NULL,
        lieu VARCHAR(100),
        titre VARCHAR(100) NOT NULL,
        description TEXT,
        montant DECIMAL(10,2) NOT NULL,
        type ENUM('revenu','depense') NOT NULL,
        sous_categorie_id INT NOT NULL,
        utilisateur_id INT NOT NULL,
        cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
        modifie_le DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sous_categorie_id) REFERENCES sous_categorie(id) ON DELETE RESTRICT,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
        INDEX idx_utilisateur_date (utilisateur_id, date_transaction)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    try{
        $pdo->exec($sql1);
        echo "Ensured table transactions exists\n";
    } catch (Exception $e) {
        // fallback: try create table without FK constraints (older/misconfigured DB)
        echo "Warning creating transactions with FK: " . $e->getMessage() . "\n";
        $fallback = "CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date_transaction DATE NOT NULL,
            lieu VARCHAR(100),
            titre VARCHAR(100) NOT NULL,
            description TEXT,
            montant DECIMAL(10,2) NOT NULL,
            type ENUM('revenu','depense') NOT NULL,
            sous_categorie_id INT NOT NULL,
            utilisateur_id INT NOT NULL,
            cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
            modifie_le DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_utilisateur_date (utilisateur_id, date_transaction)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        $pdo->exec($fallback);
        echo "Created transactions table without FK constraints (fallback)\n";
    }

    $sql2 = "CREATE TABLE IF NOT EXISTS partage_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        utilisateur_id INT NOT NULL,
        pourcentage DECIMAL(5,2) DEFAULT 100.00 CHECK (pourcentage > 0 AND pourcentage <= 100),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
        UNIQUE(transaction_id, utilisateur_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    try{
        $pdo->exec($sql2);
        echo "Ensured table partage_transactions exists\n";
    } catch (Exception $e) {
        echo "Warning creating partage_transactions with FK: " . $e->getMessage() . "\n";
        $fallback2 = "CREATE TABLE IF NOT EXISTS partage_transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            transaction_id INT NOT NULL,
            utilisateur_id INT NOT NULL,
            pourcentage DECIMAL(5,2) DEFAULT 100.00,
            UNIQUE(transaction_id, utilisateur_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        $pdo->exec($fallback2);
        echo "Created partage_transactions table without FK constraints (fallback)\n";
    }

} catch (Exception $e){
    echo "Error creating tables: " . $e->getMessage() . "\n";
    if(function_exists('ff_log')) ff_log(['create_tables_error'=>$e->getMessage()]);
}

?>
