import React, { useState } from 'react'
import { apiLogin } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    const resp = await apiLogin(email, password)
    if (resp.ok && resp.data && resp.data.ok) {
      // on success redirect to home or dashboard
      navigate('/')
    } else {
      setError(resp.data?.message || `Erreur ${resp.status}`)
    }
  }

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Se connecter</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
