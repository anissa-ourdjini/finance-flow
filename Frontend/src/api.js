// API helper for frontend
// Uses Vite env VITE_API_BASE_URL to configure backend URL
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/FinanceFlow/Backend'

async function postJson(path, body) {
  const url = `${BASE}/${path}`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  })
  const data = await resp.json().catch(() => null)
  return { ok: resp.ok, status: resp.status, data }
}

async function getJson(path) {
  const url = `${BASE}/${path}`
  const resp = await fetch(url, { credentials: 'include' })
  const data = await resp.json().catch(() => null)
  return { ok: resp.ok, status: resp.status, data }
}

export async function apiLogin(email, password) {
  return postJson('login.php', { email, password })
}

export async function apiRegister(prenom, nom, email, password) {
  return postJson('register.php', { prenom, nom, email, password })
}

// Transactions
export async function apiGetTransactions(userId) {
  const query = userId ? `?user_id=${userId}` : ''
  return getJson(`get_transactions.php${query}`)
}

export async function apiAddTransaction(tx) {
  return postJson('add_transaction.php', tx)
}

export async function apiUpdateTransaction(tx) {
  return postJson('update_transaction.php', tx)
}

export async function apiDeleteTransaction(id) {
  return postJson('delete_transaction.php', { id })
}

// Budgets
export async function apiGetBudgets(userId) {
  const query = userId ? `?user_id=${userId}` : ''
  return getJson(`get_budgets.php${query}`)
}

export async function apiAddBudget(b) {
  return postJson('add_budget.php', b)
}

export async function apiUpdateBudget(b) {
  return postJson('update_budget.php', b)
}

export default {
  apiLogin,
  apiRegister,
  apiGetTransactions,
  apiAddTransaction,
  apiUpdateTransaction,
  apiDeleteTransaction,
  apiGetBudgets,
  apiAddBudget,
  apiUpdateBudget
}
