import React, { useEffect, useState } from 'react'
import { apiGetTransactions, apiGetBudgets, apiGetCategories } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()

  useEffect(()=>{
    apiGetTransactions().then(r => { 
      if(r && r.data && r.data.transactions) setTransactions(r.data.transactions) 
    })
    apiGetBudgets().then(r => { 
      if(r && r.data && r.data.budgets) setBudgets(r.data.budgets) 
    })
    apiGetCategories().then(r => {
      if(r && r.data && r.data.categories) setCategories(r.data.categories)
    })
  }, [])

  // Calculer les dépenses pour un budget
  function calculateSpent(budget) {
    if (!budget || !transactions.length) return 0

    const depenses = transactions.filter(t => {
      if (t.type !== 'depense') return false
      if (t.categorie_id !== budget.categorie_id) return false
      
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

  const totalRevenu = transactions
    .filter(t => t.type === 'revenu')
    .reduce((s, t) => s + Number(t.montant || 0), 0)
  
  const totalDepense = transactions
    .filter(t => t.type === 'depense')
    .reduce((s, t) => s + Number(t.montant || 0), 0)

  const solde = totalRevenu - totalDepense

  // Budgets du mois en cours
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const currentBudgets = budgets.filter(b => 
    (b.periode === 'mensuel' && b.mois === currentMonth && b.annee === currentYear) ||
    (b.periode === 'annuel' && b.annee === currentYear)
  ).slice(0, 3) // Top 3

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Tableau de bord</h2>
      
      {/* Résumé financier */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Solde</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{solde.toFixed(2)} €</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {solde >= 0 ? '✓ Positif' : '⚠ Négatif'}
          </div>
        </div>

        <div style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(67, 160, 71, 0.4)'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Revenus</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{totalRevenu.toFixed(2)} €</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {transactions.filter(t => t.type === 'revenu').length} transaction(s)
          </div>
        </div>

        <div style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(239, 83, 80, 0.4)'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Dépenses</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{totalDepense.toFixed(2)} €</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {transactions.filter(t => t.type === 'depense').length} transaction(s)
          </div>
        </div>
      </div>

      {/* Budgets actifs */}
      {currentBudgets.length > 0 && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Budgets en cours</h3>
            <button
              onClick={() => navigate('/budgets')}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '2px solid #667eea',
                color: '#667eea',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              Voir tout
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {currentBudgets.map(b => {
              const spent = calculateSpent(b)
              const prevu = Number(b.montant_prevu || 0)
              const percentage = prevu > 0 ? (spent / prevu) * 100 : 0
              const isOverBudget = spent > prevu

              return (
                <div 
                  key={b.id}
                  style={{
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: `2px solid ${isOverBudget ? '#ef5350' : '#e9ecef'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <strong>{b.categorie_nom}</strong>
                    <span style={{ color: isOverBudget ? '#c62828' : '#666', fontWeight: '600' }}>
                      {spent.toFixed(0)} € / {prevu.toFixed(0)} €
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(percentage, 100)}%`,
                      background: isOverBudget 
                        ? 'linear-gradient(90deg, #ef5350, #e53935)' 
                        : percentage >= 80 
                          ? 'linear-gradient(90deg, #ff9800, #f57c00)'
                          : 'linear-gradient(90deg, #66bb6a, #43a047)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Dernières transactions */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Dernières transactions</h3>
          <button
            onClick={() => navigate('/transactions')}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '2px solid #667eea',
              color: '#667eea',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Voir tout
          </button>
        </div>

        {transactions.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
            Aucune transaction. Commencez par en ajouter !
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600' }}>Titre</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600' }}>Catégorie</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#666', fontWeight: '600' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 8).map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '1rem', color: '#666' }}>
                      {new Date(tx.date_transaction).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '1rem' }}>{tx.titre}</td>
                    <td style={{ padding: '1rem', color: '#666' }}>
                      {tx.categorie || '-'}
                    </td>
                    <td style={{ 
                      padding: '1rem', 
                      textAlign: 'right',
                      fontWeight: '700',
                      color: tx.type === 'revenu' ? '#43a047' : '#ef5350'
                    }}>
                      {tx.type === 'revenu' ? '+' : '-'}{Number(tx.montant).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
