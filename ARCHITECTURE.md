# FinanceFlow - Architecture API

## Structure Backend

### Point d'entrée unique
- **Backend/index.php** : Point d'entrée principal qui charge le routeur

### Système de routage REST
Le routeur utilise une architecture REST propre avec des URLs sémantiques :

#### Routes d'authentification
```
POST /api/auth/login       - Connexion utilisateur
POST /api/auth/register    - Inscription utilisateur
POST /api/auth/logout      - Déconnexion
```

#### Routes des transactions
```
GET    /api/transactions        - Liste toutes les transactions
POST   /api/transactions        - Créer une transaction
PUT    /api/transactions/:id    - Modifier une transaction
DELETE /api/transactions/:id    - Supprimer une transaction
```

#### Routes des catégories
```
GET /api/categories - Liste toutes les catégories
```

#### Routes des budgets
```
GET    /api/budgets        - Liste tous les budgets
POST   /api/budgets        - Créer un budget
PUT    /api/budgets/:id    - Modifier un budget
DELETE /api/budgets/:id    - Supprimer un budget
```

## Configuration Frontend

### Vite Proxy
Le frontend utilise un proxy Vite qui redirige `/api/*` vers `http://localhost:8000/Backend/*`

### Client API (`src/api.js`)
Toutes les fonctions API utilisent le préfixe `/api/` :
- `apiLogin()` → POST `/api/auth/login`
- `apiGetTransactions()` → GET `/api/transactions`
- `apiAddTransaction()` → POST `/api/transactions`
- `apiUpdateTransaction()` → PUT `/api/transactions/:id`
- etc.

## Démarrage du serveur

### Backend PHP
```bash
cd C:\wamp64\www\FinanceFlow
php -S 127.0.0.1:8000 -t Backend
```

### Frontend Vite
```bash
cd Frontend
npm run dev
```

## Améliorations apportées

✅ **Routes REST standard** : Plus de `/add_transaction.php`, mais `POST /transactions`
✅ **URLs propres** : Fini les doublons comme `/login` et `/login.php`
✅ **Point d'entrée unique** : `Backend/index.php`
✅ **Organisation claire** : Routes groupées par ressource
✅ **Codes HTTP appropriés** : 201 pour création, 403 pour accès refusé, etc.
✅ **Sécurité** : Vérification de propriété pour toutes les opérations CRUD
✅ **Gestion d'erreurs cohérente** : Même format de réponse partout

## Format de réponse

### Succès
```json
{
  "ok": true,
  "data": { ... }
}
```

### Erreur
```json
{
  "error": true,
  "message": "Description de l'erreur"
}
```
