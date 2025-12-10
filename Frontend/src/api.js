// API helper for frontend - Centralized
const getApiBase = () => {
  // In development, requests go through Vite proxy to /api
  // In production, they go directly to PHP backend
  return '/api';
};

const apiUrl = (endpoint) => getApiBase() + '/' + endpoint;

async function postJson(endpoint, body) {
  try {
    const url = apiUrl(endpoint);
    console.log('POST request to:', url);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    const data = await resp.json().catch(() => null);
    console.log('Response:', { ok: resp.ok, status: resp.status, data });
    return { ok: resp.ok, status: resp.status, data };
  } catch (err) {
    console.error('Fetch error:', err);
    return { ok: false, status: 0, data: { error: err.message } };
  }
}

async function putJson(endpoint, body) {
  const resp = await fetch(apiUrl(endpoint), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  const data = await resp.json().catch(() => null);
  return { ok: resp.ok, status: resp.status, data };
}

async function deleteJson(endpoint, body) {
  const resp = await fetch(apiUrl(endpoint), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  const data = await resp.json().catch(() => null);
  return { ok: resp.ok, status: resp.status, data };
}

async function getJson(endpoint, query = '') {
  const resp = await fetch(apiUrl(endpoint) + query, { credentials: 'include' });
  const data = await resp.json().catch(() => null);
  return { ok: resp.ok, status: resp.status, data };
}

// AUTH ROUTES
export async function apiLogin(email, password) {
  return postJson('auth/login', { email, password });
}

export async function apiRegister(prenom, nom, email, password) {
  return postJson('auth/register', { prenom, nom, email, password });
}

export async function apiLogout() {
  return postJson('auth/logout', {});
}

// TRANSACTIONS ROUTES
export async function apiGetTransactions() {
  return getJson('transactions');
}

export async function apiAddTransaction(tx) {
  return postJson('transactions', tx);
}

export async function apiUpdateTransaction(tx) {
  return putJson('transactions/' + tx.id, tx);
}

export async function apiDeleteTransaction(id) {
  return deleteJson('transactions/' + id, {});
}

// CATEGORIES ROUTES
export async function apiGetCategories() {
  return getJson('categories');
}

// BUDGETS ROUTES
export async function apiGetBudgets() {
  return getJson('budgets');
}

export async function apiAddBudget(b) {
  return postJson('budgets', b);
}

export async function apiUpdateBudget(b) {
  return putJson('budgets/' + b.id, b);
}

export async function apiDeleteBudget(id) {
  return deleteJson('budgets/' + id, {});
}

export default {
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetTransactions,
  apiAddTransaction,
  apiUpdateTransaction,
  apiDeleteTransaction,
  apiGetCategories,
  apiGetBudgets,
  apiAddBudget,
  apiUpdateBudget,
  apiDeleteBudget
}
