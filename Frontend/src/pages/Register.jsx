import React, { useState } from 'react'
import { apiRegister } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const resp = await apiRegister(prenom, nom, email, password)
    if (resp.ok && resp.data && resp.data.ok) {
      setSuccess('Inscription réussie')
      // redirect to login after short delay
      setTimeout(() => navigate('/login'), 1000)
    } else {
      setError(resp.data?.error || `Erreur ${resp.status}`)
    }
  }

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={submit}>
        <div>
          <label>Prénom</label>
          <input value={prenom} onChange={e => setPrenom(e.target.value)} required />
        </div>
        <div>
          <label>Nom</label>
          <input value={nom} onChange={e => setNom(e.target.value)} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  )
}
