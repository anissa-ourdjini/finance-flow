/**
 * Service d'authentification
 * Gère le stockage et la gestion de l'utilisateur connecté
 */

const AUTH_KEY = 'user'

export function getAuthUser() {
  const user = localStorage.getItem(AUTH_KEY)
  return user ? JSON.parse(user) : null
}

export function setAuthUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_KEY)
}

export function isAuthenticated() {
  return !!getAuthUser()
}
