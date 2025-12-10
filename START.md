# FinanceFlow - Guide de démarrage

## Démarrage rapide

### 1. Démarrer le serveur PHP Backend
```powershell
cd C:\wamp64\www\FinanceFlow
php -S 127.0.0.1:8000 -t Backend
```

### 2. Démarrer le serveur Vite Frontend (dans un autre terminal)
```powershell
cd C:\wamp64\www\FinanceFlow\Frontend
npm run dev
```

### 3. Accéder à l'application
- Frontend : http://localhost:5173
- Backend API : http://localhost:8000/Backend/

## Test de l'API

### Tester une route
```powershell
# Test de connexion
curl -X POST http://localhost:8000/Backend/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"

# Liste des catégories
curl http://localhost:8000/Backend/categories
```

## Structure des routes

Voir le fichier `ARCHITECTURE.md` pour la documentation complète des routes.
