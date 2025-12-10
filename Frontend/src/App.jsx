import './App.css'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import ProtectedRoute from './ProtectedRoute'
import { getAuthUser, clearAuthUser, isAuthenticated } from './auth'

function NavBar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement et à chaque changement de route
    const authUser = getAuthUser()
    setUser(authUser)
  }, [location])

  function handleLogout() {
    clearAuthUser()
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="top-nav">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/">Home</Link>
        {user && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/budgets">Budgets</Link>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {user.prenom} {user.nom}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/transactions" element={<ProtectedRoute element={<Transactions />} />} />
          <Route path="/budgets" element={<ProtectedRoute element={<Budgets />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
