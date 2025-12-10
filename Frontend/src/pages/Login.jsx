import React, { useState } from 'react'
import { apiLogin } from '../api'
import { useNavigate } from 'react-router-dom'
import { setAuthUser } from '../auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      const resp = await apiLogin(email, password)
      if (resp.ok && resp.data && resp.data.ok) {
        // Sauvegarder l'utilisateur dans localStorage
        setAuthUser(resp.data)
        // Rediriger vers dashboard
        navigate('/dashboard')
      } else {
        setError(resp.data?.message || resp.data?.error || `Erreur ${resp.status}`)
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error(err)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '2rem',
          color: '#2c3e50',
          fontWeight: '700'
        }}>Connexion</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#495057'
            }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '8px',
                border: '2px solid #e9ecef',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#495057'
            }}>Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '8px',
                border: '2px solid #e9ecef',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>
          <button 
            type="submit" 
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              marginTop: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >Se connecter</button>
        </form>
        {error && <p style={{ 
          color: '#e74c3c', 
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#fadbd8',
          borderRadius: '8px',
          textAlign: 'center'
        }}>{error}</p>}
      </div>
    </div>
  )
}
