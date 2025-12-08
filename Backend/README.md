Backend PHP minimal pour FinanceFlow (MySQL/WAMP)

Ce backend attend maintenant une base MySQL (ex: WAMP sur Windows). Les fichiers PHP utilisent `Backend/config.php` pour la connexion PDO.

Pré-requis
- Installer WAMP (ou un serveur Apache+MySQL+PHP équivalent) et démarrer Apache + MySQL.
- Importer le fichier `db.sql` dans une base MySQL (voir plus bas), ou utiliser `Backend/init_db.php` pour importer automatiquement (voir remarques).

Configurer la connexion
- Éditez `Backend/config.php` et modifiez `$DB_HOST`, `$DB_PORT`, `$DB_NAME`, `$DB_USER`, `$DB_PASS` pour correspondre à votre installation (ex: user `root`, password vide sur WAMP par défaut).

Importer la base de données
Option 1 — via phpMyAdmin (recommandé):
1. Ouvrez http://localhost/phpmyadmin
2. Créez une nouvelle base, par exemple `financeflow`
3. Cliquez Importer → choisissez `db.sql` (à la racine du projet) → Exécuter

Option 2 — automatique (script PHP):
- Vous pouvez exécuter `Backend/init_db.php` depuis le navigateur ou en ligne de commande après avoir mis à jour `Backend/config.php` :

  php Backend/init_db.php

  Ce script lit `db.sql` et exécute les instructions SQL sur la base MySQL configurée. Attention : le script effectue une importation naive (sépare par `;`) — vérifiez le fichier SQL en cas d'erreurs.

Lancer le backend
- Si vous utilisez WAMP et placez le dossier du projet dans `www`, servez via http://localhost/your-project
- Pour développement sans WAMP, vous pouvez aussi lancer le serveur intégré PHP (mais il doit pouvoir accéder à MySQL) :

  php -S localhost:8000 -t .

Endpoints principaux
- POST /Backend/register.php
  - Reçoit JSON: { prenom, nom, email, password }
  - Réponses JSON: { ok: true, id } ou erreurs (code 4xx/5xx)

- POST /Backend/login.php
  - Reçoit JSON: { email, password }
  - Réponses JSON: { ok: true, id, prenom, nom } ou message d'erreur

Sécurité / remarques
- `db.sql` a des constructions MySQL (AUTO_INCREMENT, ENUM, CHECK, fonctions YEAR/CURDATE) — l'import via phpMyAdmin est plus sûr.
- `Backend/init_db.php` tente d'exécuter `db.sql` sur MySQL mais peut échouer sur certains moteurs/versions. Si une erreur survient, préférez l'import manuel via phpMyAdmin.
- En production : utiliser HTTPS, sécuriser les mots de passe, ajouter validations, rate-limiting, etc.

