import React, { useEffect, useState } from 'react'
import { apiGetTransactions, apiAddTransaction, apiDeleteTransaction, apiGetCategories } from '../api'
import '../App.css'

export default function Transactions(){
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [view, setView] = useState('all') // all, revenus, depenses
  const [addType, setAddType] = useState(null) // 'revenu' or 'depense'
  
  // Formulaire simplifié
  const [titre, setTitre] = useState('')
  const [montant, setMontant] = useState('')
  const [categorieId, setCategorieId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { 
    load()
    loadCategories()
  }, [])

  async function load(){
    const res = await apiGetTransactions()
    if(res?.data?.transactions){
      setTransactions(res.data.transactions)
    }
  }

  async function loadCategories(){
    const res = await apiGetCategories()
    if(res?.data?.categories){
      setCategories(res.data.categories)
    }
  }

  async function addQuick(type){
    if(!titre || !montant) {
      alert('Renseignez le titre et le montant')
      return
    }

    const payload = {
      titre,
      montant: parseFloat(montant),
      date_transaction: date,
      type,
      categorie_id: categorieId ? parseInt(categorieId) : null
    }

    const res = await apiAddTransaction(payload)
    
    if(res.ok && res.data?.ok){
      // Réinitialiser le formulaire
      setTitre('')
      setMontant('')
      setCategorieId('')
      setDate(new Date().toISOString().split('T')[0])
      setAddType(null)
      load()
    } else {
      alert('Erreur: ' + (res.data?.message || 'Impossible d\'ajouter'))
    }
  }

  async function handleDelete(id){
    if(!confirm('Supprimer cette transaction ?')) return
    const res = await apiDeleteTransaction(id)
    if(res.ok) load()
  }

  const totalRevenu = transactions.filter(t => t.type === 'revenu').reduce((s, t) => s + Number(t.montant), 0)
  const totalDepense = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + Number(t.montant), 0)
  
  const filteredList = transactions
    .filter(t => view === 'all' || t.type === view.slice(0, -1)) // revenus -> revenu
    .sort((a, b) => new Date(b.date_transaction) - new Date(a.date_transaction))

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Mes Transactions</h2>

      {/* Ajout rapide */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Ajouter une transaction</h3>
        
        {/* Choix type */}
        {!addType ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              onClick={() => setAddType('revenu')}
              style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.25rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(67, 160, 71, 0.3)'
              }}
            >
              + Ajouter un Revenu
            </button>
            <button
              onClick={() => setAddType('depense')}
              style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.25rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239, 83, 80, 0.3)'
              }}
            >
              - Ajouter une Dépense
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              padding: '1rem',
              background: addType === 'revenu' ? '#e8f5e9' : '#ffebee',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <strong style={{ color: addType === 'revenu' ? '#2e7d32' : '#c62828' }}>
                {addType === 'revenu' ? '💰 Nouveau Revenu' : '💸 Nouvelle Dépense'}
              </strong>
              <button
                onClick={() => {
                  setAddType(null)
                  setTitre('')
                  setMontant('')
                  setCategorieId('')
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Titre (ex: Salaire, Courses...)"
                value={titre}
                onChange={e => setTitre(e.target.value)}
                style={{
                  padding: '1rem',
                  fontSize: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />

              <input
                type="number"
                step="0.01"
                placeholder="Montant (€)"
                value={montant}
                onChange={e => setMontant(e.target.value)}
                style={{
                  padding: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />

              <select
                value={categorieId}
                onChange={e => setCategorieId(e.target.value)}
                style={{
                  padding: '1rem',
                  fontSize: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              >
                <option value="">Catégorie (optionnel)</option>
                {categories.filter(c => c.type === addType).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>

              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{
                  padding: '1rem',
                  fontSize: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />

              <button
                onClick={() => addQuick(addType)}
                style={{
                  padding: '1.25rem',
                  background: addType === 'revenu' 
                    ? 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)'
                    : 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                ✓ Enregistrer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Résumé */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>Revenus</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#43a047' }}>+{totalRevenu.toFixed(2)} €</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>Dépenses</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ef5350' }}>-{totalDepense.toFixed(2)} €</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>Solde</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: totalRevenu - totalDepense >= 0 ? '#43a047' : '#ef5350' }}>
            {(totalRevenu - totalDepense).toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'revenus', 'depenses'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '0.75rem 1.5rem',
                background: view === v ? '#667eea' : '#f5f5f5',
                color: view === v ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {v === 'all' ? 'Tout' : v === 'revenus' ? 'Revenus' : 'Dépenses'}
            </button>
          ))}
        </div>

        {/* Liste */}
        {filteredList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '3rem' }}>
            Aucune transaction. Commencez par en ajouter une !
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {filteredList.map(tx => (
              <div
                key={tx.id}
                style={{
                  padding: '1.25rem',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: `4px solid ${tx.type === 'revenu' ? '#43a047' : '#ef5350'}`
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                    {tx.titre}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {new Date(tx.date_transaction).toLocaleDateString('fr-FR')}
                    {tx.categorie && ` • ${tx.categorie}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: tx.type === 'revenu' ? '#43a047' : '#ef5350'
                  }}>
                    {tx.type === 'revenu' ? '+' : '-'}{Number(tx.montant).toFixed(2)} €
                  </div>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    style={{
                      background: '#ffebee',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#c62828',
                      fontWeight: '600'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
