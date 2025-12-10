import React, { useEffect, useState } from 'react'
import { apiGetTransactions, apiAddTransaction, apiUpdateTransaction, apiDeleteTransaction } from '../api'
import '../App.css'

export default function Transactions(){
  const [transactions, setTransactions] = useState([])
  const [filteredTx, setFilteredTx] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [tab, setTab] = useState('revenus') // revenus, depenses, all
  const [form, setForm] = useState({
    titre: '',
    montant: '',
    date_transaction: new Date().toISOString().split('T')[0],
    type: 'revenu',
    lieu: '',
    description: ''
  })

  useEffect(() => { load() }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, tab])

  async function load(){
    try {
      const res = await apiGetTransactions()
      if(res && res.data && res.data.transactions){
        setTransactions(res.data.transactions)
      }
    } catch(e){
      console.error('Error:', e)
    }
  }

  function filterTransactions(){
    let filtered = transactions
    if(tab === 'revenus') filtered = transactions.filter(t => t.type === 'revenu')
    else if(tab === 'depenses') filtered = transactions.filter(t => t.type === 'depense')
    setFilteredTx(filtered.sort((a, b) => new Date(b.date_transaction) - new Date(a.date_transaction)))
  }

  function openModal(tx = null){
    if(tx){
      setEditingId(tx.id)
      setForm({
        titre: tx.titre,
        montant: tx.montant,
        date_transaction: tx.date_transaction.split('T')[0],
        type: tx.type,
        lieu: tx.lieu || '',
        description: tx.description || ''
      })
    } else {
      setEditingId(null)
      setForm({
        titre: '',
        montant: '',
        date_transaction: new Date().toISOString().split('T')[0],
        type: 'revenu',
        lieu: '',
        description: ''
      })
    }
    setShowModal(true)
  }

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const payload = {
      titre: form.titre,
      montant: parseFloat(form.montant),
      date_transaction: form.date_transaction,
      type: form.type,
      lieu: form.lieu,
      description: form.description,
      utilisateur_id: user.id || null
    }

    try {
      let res
      if(editingId){
        res = await apiUpdateTransaction({ ...payload, id: editingId })
      } else {
        res = await apiAddTransaction(payload)
      }

      if(res.ok && res.data && res.data.ok){
        setShowModal(false)
        load()
      } else {
        alert('Erreur: ' + (res.data?.message || 'Impossible de sauvegarder'))
      }
    } catch(e){
      console.error('Error:', e)
      alert('Erreur réseau')
    }
    setLoading(false)
  }

  async function handleDelete(id){
    if(!confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) return
    
    try {
      const res = await apiDeleteTransaction(id)
      if(res.ok && res.data && res.data.ok){
        load()
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch(e){
      console.error('Error:', e)
    }
  }

  const totalRevenue = transactions
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + parseFloat(t.montant || 0), 0)
  
  const totalExpense = transactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + parseFloat(t.montant || 0), 0)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Transactions & Revenus</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Ajouter</button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'revenus' ? 'active' : ''}`} onClick={() => setTab('revenus')}>
          Revenus ({transactions.filter(t => t.type === 'revenu').length})
        </button>
        <button className={`tab ${tab === 'depenses' ? 'active' : ''}`} onClick={() => setTab('depenses')}>
          Dépenses ({transactions.filter(t => t.type === 'depense').length})
        </button>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          Tout ({transactions.length})
        </button>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Revenus</div>
          <div className="stat-value income">{totalRevenue.toFixed(2)}€</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dépenses</div>
          <div className="stat-value expense">{totalExpense.toFixed(2)}€</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Bilan</div>
          <div className={`stat-value ${totalRevenue - totalExpense >= 0 ? 'income' : 'expense'}`}>
            {(totalRevenue - totalExpense).toFixed(2)}€
          </div>
        </div>
      </div>

      <div className="transactions-list">
        {filteredTx.length === 0 ? (
          <p className="empty">Aucune transaction pour cette catégorie</p>
        ) : (
          filteredTx.map(tx => (
            <div key={tx.id} className="transaction-card">
              <div className="tx-header">
                <div>
                  <div className="tx-title">{tx.titre}</div>
                  <div className="tx-meta">
                    {new Date(tx.date_transaction).toLocaleDateString('fr-FR')}
                    {tx.categorie && ` • ${tx.categorie}`}
                    {tx.lieu && ` • ${tx.lieu}`}
                  </div>
                </div>
                <div className={`tx-amount ${tx.type}`}>
                  {tx.type === 'revenu' ? '+' : '-'}{parseFloat(tx.montant).toFixed(2)}€
                </div>
              </div>
              {tx.description && <div className="tx-description">{tx.description}</div>}
              <div className="tx-actions">
                <button className="btn-small" onClick={() => openModal(tx)}>Modifier</button>
                <button className="btn-small btn-danger" onClick={() => handleDelete(tx.id)}>Supprimer</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Modifier' : 'Ajouter'} une transaction</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="revenu">Revenu</option>
                  <option value="depense">Dépense</option>
                </select>
              </div>
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={e => setForm({...form, titre: e.target.value})}
                  required
                  placeholder="Ex: Salaire, Épicerie"
                />
              </div>
              <div className="form-group">
                <label>Montant (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.montant}
                  onChange={e => setForm({...form, montant: e.target.value})}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={form.date_transaction}
                  onChange={e => setForm({...form, date_transaction: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Lieu</label>
                <input
                  type="text"
                  value={form.lieu}
                  onChange={e => setForm({...form, lieu: e.target.value})}
                  placeholder="Ex: Carrefour"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Notes"
                  rows="3"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
