-- Table des utilisateurs
-- DROP existing tables (safe order) to allow clean reimport
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS partage_transactions;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS budget;
DROP TABLE IF EXISTS sous_categorie;
DROP TABLE IF EXISTS categorie;
DROP TABLE IF EXISTS utilisateur;
SET FOREIGN_KEY_CHECKS = 1;

-- NOTE: This will remove existing data. Only use in development or when you are sure.

CREATE TABLE utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(50) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des catégories
CREATE TABLE categorie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('revenu', 'depense') NOT NULL DEFAULT 'depense',
    couleur VARCHAR(7) DEFAULT '#3788d8'  -- pour Chart.js
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des sous-catégories
CREATE TABLE sous_categorie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    categorie_id INT NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categorie(id) ON DELETE CASCADE,
    UNIQUE(nom, categorie_id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des transactions
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_transaction DATE NOT NULL,
    lieu VARCHAR(100),
    titre VARCHAR(100) NOT NULL,
    description TEXT,
    montant DECIMAL(10,2) NOT NULL,
    type ENUM('revenu', 'depense') NOT NULL,
    sous_categorie_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    modifie_le DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sous_categorie_id) REFERENCES sous_categorie(id) ON DELETE RESTRICT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_date (utilisateur_id, date_transaction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de partage des transactions entre utilisateurs
CREATE TABLE partage_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    pourcentage DECIMAL(5,2) DEFAULT 100.00 CHECK (pourcentage > 0 AND pourcentage <= 100),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    UNIQUE(transaction_id, utilisateur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des budgets (par catégorie/sous-catégorie et par utilisateur)
CREATE TABLE budget (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    sous_categorie_id INT,           -- NULL = budget pour toute la catégorie
    categorie_id INT,                -- obligatoire si sous_categorie_id NULL
    montant_prevu DECIMAL(10,2) NOT NULL,
    periode ENUM('mensuel', 'annuel') DEFAULT 'mensuel',
    annee INT NOT NULL DEFAULT (YEAR(CURDATE())),
    mois INT NULL,                   -- NULL si annuel
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (sous_categorie_id) REFERENCES sous_categorie(id) ON DELETE SET NULL,
    FOREIGN KEY (categorie_id) REFERENCES categorie(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- NOTE: CHECK constraint removed for compatibility. Enforce the sous_categorie/categorie mutual exclusion in application logic or with triggers if needed.