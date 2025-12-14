-- FinanceFlow Database Schema
-- Version: 4.0 - Cohérent avec le code backend
-- Date: 2025-12-14

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS partage_transactions;
DROP TABLE IF EXISTS budget;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS sous_categorie;
DROP TABLE IF EXISTS categorie;
DROP TABLE IF EXISTS utilisateur;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Table des utilisateurs
-- ============================================================
CREATE TABLE utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table des catégories
-- ============================================================
CREATE TABLE categorie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('revenu', 'depense') NOT NULL DEFAULT 'depense',
    couleur VARCHAR(7) DEFAULT '#3788d8',
    icone VARCHAR(50) DEFAULT 'folder',
    description TEXT,
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table des sous-catégories
-- ============================================================
CREATE TABLE sous_categorie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    categorie_id INT NOT NULL,
    couleur VARCHAR(7),
    icone VARCHAR(50),
    FOREIGN KEY (categorie_id) REFERENCES categorie(id) ON DELETE CASCADE,
    UNIQUE KEY unique_nom_cat (nom, categorie_id),
    INDEX idx_categorie (categorie_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table des transactions
-- ============================================================
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    date_transaction DATE NOT NULL,
    titre VARCHAR(150) NOT NULL,
    montant DECIMAL(12,2) NOT NULL,
    type ENUM('revenu', 'depense') NOT NULL,
    lieu VARCHAR(150),
    description TEXT,
    sous_categorie_id INT,
    categorie_id INT,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    modifie_le DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (sous_categorie_id) REFERENCES sous_categorie(id) ON DELETE SET NULL,
    FOREIGN KEY (categorie_id) REFERENCES categorie(id) ON DELETE SET NULL,
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_date (date_transaction),
    INDEX idx_type (type),
    INDEX idx_categorie (categorie_id),
    INDEX idx_sous_categorie (sous_categorie_id),
    INDEX idx_utilisateur_date (utilisateur_id, date_transaction DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table des budgets
-- ============================================================
CREATE TABLE budget (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    categorie_id INT,
    sous_categorie_id INT,
    montant_prevu DECIMAL(12,2) NOT NULL,
    montant_utilise DECIMAL(12,2) DEFAULT 0,
    periode ENUM('mensuel', 'annuel') DEFAULT 'mensuel',
    annee INT NOT NULL,
    mois INT,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    modifie_le DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (categorie_id) REFERENCES categorie(id) ON DELETE SET NULL,
    FOREIGN KEY (sous_categorie_id) REFERENCES sous_categorie(id) ON DELETE SET NULL,
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_periode (annee, mois),
    INDEX idx_categorie (categorie_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table de partage des transactions
-- ============================================================
CREATE TABLE partage_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    pourcentage DECIMAL(5,2) DEFAULT 100.00,
    montant DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    UNIQUE KEY unique_partage (transaction_id, utilisateur_id),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Données de test - Catégories
-- ============================================================
INSERT INTO categorie (nom, type, couleur, icone, description) VALUES
('Salaire', 'revenu', '#27ae60', 'briefcase', 'Revenus du travail'),
('Bonus', 'revenu', '#2ecc71', 'star', 'Bonus et primes'),
('Investissements', 'revenu', '#16a085', 'trending-up', 'Revenus d''investissements'),
('Alimentation', 'depense', '#3498db', 'shopping-cart', 'Épicerie et courses'),
('Restaurant', 'depense', '#e74c3c', 'utensils', 'Repas au restaurant'),
('Transport', 'depense', '#f39c12', 'car', 'Carburant et transports'),
('Logement', 'depense', '#95a5a6', 'home', 'Loyer et charges'),
('Énergie', 'depense', '#34495e', 'zap', 'Électricité, eau, gaz'),
('Santé', 'depense', '#c0392b', 'heart', 'Médicaments et santé'),
('Loisirs', 'depense', '#9b59b6', 'gamepad2', 'Loisirs et divertissements');

-- ============================================================
-- Données de test - Sous-catégories
-- ============================================================
INSERT INTO sous_categorie (nom, categorie_id, couleur, icone) VALUES
('Salaire net', 1, '#27ae60', 'dollar-sign'),
('Primes', 2, '#2ecc71', 'gift'),
('Actions', 3, '#16a085', 'trending-up'),
('Épicerie', 4, '#3498db', 'shopping-basket'),
('Fruits et légumes', 4, '#3498db', 'apple-alt'),
('Viande et poisson', 4, '#3498db', 'fish'),
('Pizza', 5, '#e74c3c', 'pizza-slice'),
('Café', 5, '#e74c3c', 'coffee'),
('Essence', 6, '#f39c12', 'gas-pump'),
('Transports en commun', 6, '#f39c12', 'bus'),
('Loyer', 7, '#95a5a6', 'home'),
('Électricité', 8, '#34495e', 'bolt'),
('Eau', 8, '#34495e', 'tint'),
('Pharmacie', 9, '#c0392b', 'pills'),
('Cinéma', 10, '#9b59b6', 'film'),
('Streaming', 10, '#9b59b6', 'play-circle');

-- ============================================================
-- Utilisateur de test
-- Mot de passe: password (hashé avec bcrypt)
-- ============================================================
INSERT INTO utilisateur (prenom, nom, email, mot_de_passe) VALUES
('Jean', 'Dupont', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/ym2');

-- ============================================================
-- Transactions de test
-- ============================================================
INSERT INTO transactions (utilisateur_id, date_transaction, titre, montant, type, lieu, description, sous_categorie_id, categorie_id) VALUES
(1, CURDATE(), 'Salaire mensuel', 2500.00, 'revenu', NULL, 'Salaire du mois', 1, 1),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Courses Carrefour', 85.50, 'depense', 'Carrefour', 'Courses hebdomadaires', 4, 4),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Dîner restaurant', 45.00, 'depense', 'Restaurant Italien', 'Dîner en famille', 7, 5),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Plein d''essence', 60.00, 'depense', 'Station Total', 'Carburant voiture', 9, 6),
(1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Loyer décembre', 800.00, 'depense', NULL, 'Paiement loyer mensuel', 11, 7),
(1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Électricité', 65.00, 'depense', NULL, 'Facture électricité', 12, 8),
(1, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'Prime performance', 300.00, 'revenu', NULL, 'Prime trimestrielle', 2, 2);

-- ============================================================
-- Budgets de test
-- ============================================================
INSERT INTO budget (utilisateur_id, categorie_id, montant_prevu, montant_utilise, periode, annee, mois) VALUES
(1, 4, 400.00, 85.50, 'mensuel', YEAR(CURDATE()), MONTH(CURDATE())),
(1, 5, 200.00, 45.00, 'mensuel', YEAR(CURDATE()), MONTH(CURDATE())),
(1, 6, 150.00, 60.00, 'mensuel', YEAR(CURDATE()), MONTH(CURDATE())),
(1, 7, 800.00, 800.00, 'mensuel', YEAR(CURDATE()), MONTH(CURDATE())),
(1, 8, 100.00, 65.00, 'mensuel', YEAR(CURDATE()), MONTH(CURDATE()));