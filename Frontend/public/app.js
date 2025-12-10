// Shared budget data and helpers (page-agnostic)
const DEFAULT_CATEGORIES = [
  {name: 'Snacks', color: '#ffd6d6'},
  {name: 'Jeux', color: '#cbe4ff'},
  {name: 'Peluches', color: '#fff1c6'},
  {name: 'Boba', color: '#f7d6f0'}
];

let state = {
  income: 1200,
  transactions: []
};

function loadState(){
  try{
    const raw = localStorage.getItem('ff2_state');
    if(raw) state = JSON.parse(raw);
  }catch(e){ console.warn('failed load state', e); }
}

function saveState(){
  try{
    localStorage.setItem('ff2_state', JSON.stringify(state));
  }catch(e){ console.warn('failed save', e); }
}

function computeTotals(){
  const totals = {};
  DEFAULT_CATEGORIES.forEach(c => totals[c.name] = 0);
  let totalSpent = 0;
  state.transactions.forEach(tx => {
    if(totals[tx.category] !== undefined){ totals[tx.category] += tx.amount; }
    totalSpent += tx.amount;
  });
  return { totals, totalSpent };
}

function addTransaction(tx){
  // tx: {title, amount, category, date}
  state.transactions.push(tx);
  saveState();
}

function setIncome(v){ state.income = Number(v) || state.income; saveState(); }

function ensureDemo(){
  if(!state.transactions || state.transactions.length === 0){
    state.transactions = [
      {title:'Bubble tea',amount:8,category:'Boba',date:new Date().toISOString()},
      {title:'Bonbons',amount:12,category:'Snacks',date:new Date().toISOString()},
      {title:'Jeu',amount:40,category:'Jeux',date:new Date().toISOString()}
    ];
    saveState();
  }
}

// init shared state
loadState();

// try to load state from backend API (if available), otherwise fallback to local demo
function tryLoadFromServer(){
  // Use direct backend URL for development
  const url = 'http://127.0.0.1:8000/Backend/router.php/transactions';
  return fetch(url, { credentials: 'include' })
    .then(r => {
      if(!r.ok) throw new Error('no server data');
      return r.json();
    })
    .then(data => {
      if(data && Array.isArray(data.transactions) && data.transactions.length > 0){
        // merge server data into client state
        state.transactions = data.transactions.map(tx => ({
          title: tx.titre || tx.title || 'Tx',
          amount: Number(tx.montant || tx.amount) || 0,
          category: tx.categorie || tx.category || tx.category_name || 'Snacks',
          date: tx.date_transaction || tx.date || new Date().toISOString()
        }));
        if(data.income) state.income = Number(data.income) || state.income;
        saveState();
        return true;
      }
      throw new Error('no transactions');
    })
    .catch(e => {
      // server not available or returned empty — caller will fallback
      console.info('no server state loaded:', e.message);
      return false;
    });
}

tryLoadFromServer().then(loaded => {
  if(!loaded){ ensureDemo(); }
});

// expose API to pages
window.Budget = {
  DEFAULT_CATEGORIES,
  state,
  loadState,
  saveState,
  computeTotals,
  addTransaction,
  setIncome
};
