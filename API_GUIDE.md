# FinanceFlow API - Guide d'utilisation

## Base URL
- **Développement** : `http://localhost:5173/api` (via proxy Vite)
- **Production** : À configurer selon votre hébergement

## Authentification

### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "prenom": "John",
  "nom": "Doe",
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

**Réponse** :
```json
{
  "ok": true,
  "id": 1
}
```

### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

**Réponse** :
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "prenom": "John",
    "nom": "Doe",
    "email": "john@example.com"
  }
}
```

### Déconnexion
```http
POST /api/auth/logout
```

**Réponse** :
```json
{
  "ok": true
}
```

## Transactions

### Liste des transactions
```http
GET /api/transactions
```

**Réponse** :
```json
{
  "ok": true,
  "transactions": [
    {
      "id": 1,
      "titre": "Courses",
      "montant": 45.50,
      "type": "depense",
      "date_transaction": "2025-12-10",
      "lieu": "Carrefour",
      "description": "Courses hebdomadaires",
      "categorie": "Alimentation",
      "sous_categorie": "Courses",
      "categorie_id": 1,
      "sous_categorie_id": 2
    }
  ]
}
```

### Créer une transaction
```http
POST /api/transactions
Content-Type: application/json

{
  "titre": "Salaire",
  "montant": 2500.00,
  "type": "revenu",
  "date_transaction": "2025-12-01",
  "categorie_id": 5
}
```

**Réponse** :
```json
{
  "ok": true,
  "id": 2
}
```

### Modifier une transaction
```http
PUT /api/transactions/2
Content-Type: application/json

{
  "montant": 2600.00
}
```

**Réponse** :
```json
{
  "ok": true,
  "updated": 1
}
```

### Supprimer une transaction
```http
DELETE /api/transactions/2
```

**Réponse** :
```json
{
  "ok": true,
  "deleted": 1
}
```

## Catégories

### Liste des catégories
```http
GET /api/categories
```

**Réponse** :
```json
{
  "ok": true,
  "categories": [
    {
      "id": 1,
      "nom": "Alimentation",
      "type": "depense",
      "couleur": "#FF6B6B",
      "icone": "🍔",
      "description": "Nourriture et boissons"
    }
  ]
}
```

## Budgets

### Liste des budgets
```http
GET /api/budgets
```

**Réponse** :
```json
{
  "ok": true,
  "budgets": [
    {
      "id": 1,
      "categorie_id": 1,
      "sous_categorie_id": null,
      "categorie_nom": "Alimentation",
      "montant_prevu": 500.00,
      "montant_utilise": 245.50,
      "periode": "mensuel",
      "annee": 2025,
      "mois": 12
    }
  ]
}
```

### Créer un budget
```http
POST /api/budgets
Content-Type: application/json

{
  "categorie_id": 1,
  "montant_prevu": 500.00,
  "periode": "mensuel",
  "annee": 2025,
  "mois": 12
}
```

**Réponse** :
```json
{
  "ok": true,
  "id": 1
}
```

### Modifier un budget
```http
PUT /api/budgets/1
Content-Type: application/json

{
  "montant_prevu": 600.00
}
```

**Réponse** :
```json
{
  "ok": true,
  "updated": 1
}
```

### Supprimer un budget
```http
DELETE /api/budgets/1
```

**Réponse** :
```json
{
  "ok": true,
  "deleted": 1
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Création réussie |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Route non trouvée |
| 409 | Conflit (ex: email déjà utilisé) |
| 422 | Champs requis manquants |
| 500 | Erreur serveur |

## Format d'erreur

```json
{
  "error": true,
  "message": "Description de l'erreur"
}
```

## Notes importantes

- Toutes les routes sauf `/auth/*` et `/categories` nécessitent une authentification
- Les sessions sont gérées via cookies
- L'utilisateur ne peut accéder qu'à ses propres transactions et budgets
- Les dates doivent être au format ISO (YYYY-MM-DD)
