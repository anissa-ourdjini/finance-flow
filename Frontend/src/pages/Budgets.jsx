import React, { useEffect, useState } from 'react'
import { apiGetBudgets, apiAddBudget, apiGetCategories, apiGetTransactions, apiDeleteBudget } from '../api'

export default function Budgets(){
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState({ 
    categorie_id: '', 
    montant_prevu: '', 
    periode: 'mensuel',
    annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    // Charger budgets, catégories et transactions
    apiGetBudgets().then(r => { 
      if(r && r.data && r.data.budgets) setBudgets(r.data.budgets) 
    })
    apiGetCategories().then(r => {
      if(r && r.data && r.data.categories) setCategories(r.data.categories)
    })
    apiGetTransactions().then(r => {
      if(r && r.data && r.data.transactions) setTransactions(r.data.transactions)
    })
  }, [])

  // Calculer les dépenses réelles pour un budget
  function calculateSpent(budget) {
    if (!budget || !transactions.length) return 0

    const depenses = transactions.filter(t => {
      // Filtrer par type dépense
      if (t.type !== 'depense') return false
      
      // Filtrer par catégorie
      if (t.categorie_id !== budget.categorie_id) return false
      
      // Filtrer par période
      const txDate = new Date(t.date_transaction)
      const txYear = txDate.getFullYear()
      const txMonth = txDate.getMonth() + 1
      
      if (budget.periode === 'mensuel') {
        return txYear === budget.annee && txMonth === budget.mois
      } else if (budget.periode === 'annuel') {
        return txYear === budget.annee
      }
      
      return false
    })

    return depenses.reduce((sum, t) => sum + Number(t.montant || 0), 0)
  }

  async function add(e) { 
    e.preventDefault()
    setError(null)
    
    const budgetData = {
      categorie_id: Number(form.categorie_id),
      montant_prevu: Number(form.montant_prevu),
      periode: form.periode,
      annee: Number(form.annee),
      mois: form.periode === 'mensuel' ? Number(form.mois) : null
    }
    
    const res = await apiAddBudget(budgetData)
    
    if(res.ok && res.data && res.data.ok) { 
      apiGetBudgets().then(r => setBudgets(r.data.budgets))
      setForm({
        categorie_id: '', 
        montant_prevu: '', 
        periode: 'mensuel',
        annee: new Date().getFullYear(),
        mois: new Date().getMonth() + 1
      })
      setError(null)
    } else {
      setError(res.data?.message || res.data?.error || 'Erreur lors de l\'ajout du budget')
    }
  }

  async function handleDelete(budgetId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) return
    
    const res = await apiDeleteBudget(budgetId)
    if (res.ok && res.data && res.data.ok) {
      apiGetBudgets().then(r => setBudgets(r.data.budgets))
      setError(null)
    } else {
      setError(res.data?.message || res.data?.error || 'Erreur lors de la suppression du budget')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Mes Budgets</h2>
      
      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '8px',
          border: '1px solid #ef5350'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={add} style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        display: 'grid',
        gap: '1rem'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Catégorie *
          </label>
          <select 
            value={form.categorie_id} 
            onChange={e => setForm({...form, categorie_id: e.target.value})} 
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          >
            <option value="">-- Sélectionnez une catégorie --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nom} ({cat.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Montant prévu (€) *
          </label>
          <input 
            placeholder="Ex: 500" 
            type="number" 
            step="0.01"
            min="0"
            value={form.montant_prevu} 
            onChange={e => setForm({...form, montant_prevu: e.target.value})} 
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Période *
          </label>
          <select 
            value={form.periode} 
            onChange={e => setForm({...form, periode: e.target.value})} 
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          >
            <option value="mensuel">Mensuel</option>
            <option value="annuel">Annuel</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Année *
            </label>
            <input 
              type="number" 
              value={form.annee} 
              onChange={e => setForm({...form, annee: e.target.value})} 
              required
              min="2020"
              max="2100"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            />
          </div>

          {form.periode === 'mensuel' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Mois *
              </label>
              <select 
                value={form.mois} 
                onChange={e => setForm({...form, mois: e.target.value})} 
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
              >
                <option value="1">Janvier</option>
                <option value="2">Février</option>
                <option value="3">Mars</option>
                <option value="4">Avril</option>
                <option value="5">Mai</option>
                <option value="6">Juin</option>
                <option value="7">Juillet</option>
                <option value="8">Août</option>
                <option value="9">Septembre</option>
                <option value="10">Octobre</option>
                <option value="11">Novembre</option>
                <option value="12">Décembre</option>
              </select>
            </div>
          )}
        </div>

        <button 
          type="submit"
          style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          Ajouter le budget
        </button>
      </form>

      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Budgets existants</h3>
        
        {budgets.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
            Aucun budget défini. Créez votre premier budget pour suivre vos dépenses !
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {budgets.map(b => {
              const spent = calculateSpent(b)
              const prevu = Number(b.montant_prevu || 0)
              const percentage = prevu > 0 ? (spent / prevu) * 100 : 0
              const isOverBudget = spent > prevu
              const isNearLimit = percentage >= 80 && percentage < 100
              
              const getMoisNom = (m) => {
                const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
                return mois[m - 1] || m
              }

              return (
                <div 
                  key={b.id}
                  style={{
                    padding: '1.5rem',
                    background: 'white',
                    borderRadius: '12px',
                    border: `2px solid ${isOverBudget ? '#ef5350' : isNearLimit ? '#ff9800' : '#e9ecef'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  {/* En-tête */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#333' }}>
                        {b.categorie_nom || `Catégorie ${b.categorie_id}`}
                      </h3>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                        {b.periode === 'mensuel' ? getMoisNom(b.mois) : 'Année'} {b.annee}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {isOverBudget && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: '#ffebee',
                          color: '#c62828',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          ⚠️ Dépassé
                        </span>
                      )}
                      {isNearLimit && !isOverBudget && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: '#fff3e0',
                          color: '#ef6c00',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          ⚡ Attention
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(b.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#f5f5f5',
                          color: '#d32f2f',
                          border: '1px solid #ef5350',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = '#ffebee'
                          e.target.style.borderColor = '#c62828'
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = '#f5f5f5'
                          e.target.style.borderColor = '#ef5350'
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>
                      <span>Dépensé</span>
                      <span>{percentage.toFixed(0)}%</span>
                    </div>
                    <div style={{
                      height: '12px',
                      background: '#f0f0f0',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(percentage, 100)}%`,
                        background: isOverBudget 
                          ? 'linear-gradient(90deg, #ef5350, #e53935)' 
                          : isNearLimit 
                            ? 'linear-gradient(90deg, #ff9800, #f57c00)'
                            : 'linear-gradient(90deg, #66bb6a, #43a047)',
                        transition: 'width 0.3s ease',
                        borderRadius: '6px'
                      }}></div>
                    </div>
                  </div>

                  {/* Montants */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem' }}>
                        Dépensé
                      </div>
                      <div style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '700', 
                        color: isOverBudget ? '#c62828' : '#333'
                      }}>
                        {spent.toFixed(2)} €
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem' }}>
                        Budget
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#667eea' }}>
                        {prevu.toFixed(2)} €
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem' }}>
                        Restant
                      </div>
                      <div style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '700',
                        color: isOverBudget ? '#c62828' : '#43a047'
                      }}>
                        {(prevu - spent).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
