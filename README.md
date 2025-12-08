FinanceFlow2 — Cute Budget (static web demo)

What this is
- A small static web app replicating the "cute" budget UI from the mock.
- Features: add transactions, category breakdown, donut chart, simple progress bars.

How to run
1. Open the file `index.html` in your web browser (double-click or drag to browser). This is the login page.
2. After login you'll be redirected to `dashboard.html` (or open it directly). The charts live in `charts.html`.
3. The app stores data in `localStorage` — refresh will keep added transactions.

Files
- `index.html` — login page
- `dashboard.html` — main budget page (add transactions, category breakdown)
- `charts.html` — charts page (donut chart)
- `styles.css` — styles
- `app.js` — shared data/helpers (localStorage)
- `dashboard.js` — dashboard UI logic
- `charts.js` — charts UI logic (uses Chart.js from CDN)

Notes & next steps
- No server required. If you want a dev server, install a simple static server and run it.
- Possible improvements: persistent backend, authentication, better forms and edit/delete transactions, monthly filtering and reports.

Designed to be a minimal, runnable demonstration. Open `index.html` to try it.