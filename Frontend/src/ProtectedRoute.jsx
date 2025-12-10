import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from './auth'

/**
 * ProtectedRoute - Protège les pages en vérifiant l'authentification
 * Redirige vers Login si l'utilisateur n'est pas connecté
 */
export default function ProtectedRoute({ element }) {
  const [isAuth, setIsAuth] = useState(null)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    setIsAuth(isAuthenticated())
  }, [])

  // En attente de vérification
  if (isAuth === null) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Vérification...</div>
  }

  // Rediriger vers login si non authentifié
  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  // Afficher le composant protégé
  return element
}
