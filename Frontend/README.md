# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Notes — connexion au backend

Cette application frontend attend une API PHP simple exposée (par exemple via WAMP ou PHP built-in) qui contient les endpoints suivants dans le dossier `Backend` :

- `login.php` — POST JSON { email, password }
- `register.php` — POST JSON { prenom, nom, email, password }

Par défaut l'URL de base est `http://localhost/FinanceFlow/Backend`. Pour changer cela en local, créez un fichier `.env` à la racine du dossier `Frontend` et ajoutez :

VITE_API_BASE_URL="http://localhost/FinanceFlow/Backend"

Puis lancez le dev server :

```powershell
cd Frontend
npm install
npm run dev
```

Les pages accessibles depuis le menu : `/` (accueil), `/login` et `/register`.
