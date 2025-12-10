import React, { useEffect, useState } from 'react'
import { apiGetTransactions, apiGetBudgets, apiGetCategories } from '../api'
import { useNavigate } from 'react-router-dom'

// Graphique en courbes - Évolution mensuelle
function LineChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', color: '#999', padding: '3rem' }}>Aucune donnée disponible</div>
  }

  const maxValue = Math.max(...data.flatMap(d => [d.revenus, d.depenses]), 0)
  const padding = 40
  const width = 600
  const height = 250
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const getX = (index) => padding + (index / (data.length - 1 || 1)) * chartWidth
  const getY = (value) => padding + chartHeight - (value / maxValue) * chartHeight

  const revenuPoints = data.map((d, i) => `${getX(i)},${getY(d.revenus)}`).join(' ')
  const depensePoints = data.map((d, i) => `${getX(i)},${getY(d.depenses)}`).join(' ')

  return (
    <svg width="100%" height="250" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {/* Grille horizontale */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding + chartHeight * (1 - ratio)
        return (
          <g key={ratio}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={padding - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#999">
              {(maxValue * ratio).toFixed(0)}€
            </text>
          </g>
        )
      })}

      {/* Ligne des revenus */}
      <polyline
        points={revenuPoints}
        fill="none"
        stroke="#43a047"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Ligne des dépenses */}
      <polyline
        points={depensePoints}
        fill="none"
        stroke="#ef5350"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points sur les revenus */}
      {data.map((d, i) => (
        <circle key={`r${i}`} cx={getX(i)} cy={getY(d.revenus)} r="5" fill="#43a047" stroke="white" strokeWidth="2" />
      ))}

      {/* Points sur les dépenses */}
      {data.map((d, i) => (
        <circle key={`d${i}`} cx={getX(i)} cy={getY(d.depenses)} r="5" fill="#ef5350" stroke="white" strokeWidth="2" />
      ))}

      {/* Labels des mois */}
      {data.map((d, i) => (
        <text
          key={`l${i}`}
          x={getX(i)}
          y={height - 10}
          textAnchor="middle"
          fontSize="11"
          fill="#666"
          fontWeight="600"
        >
          {d.label}
        </text>
      ))}
    </svg>
  )
}

// Graphique en barres amélioré avec comparaison budget vs dépenses
function BudgetComparisonChart({ budgets, transactions }) {
  if (!budgets || budgets.length === 0) {
    return <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>Aucun budget défini</div>
  }

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const chartData = budgets
    .filter(b => 
      (b.periode === 'mensuel' && b.mois === currentMonth && b.annee === currentYear) ||
      (b.periode === 'annuel' && b.annee === currentYear)
    )
    .slice(0, 5)
    .map(b => {
      const spent = transactions
        .filter(t => {
          if (t.type !== 'depense' || t.categorie_id !== b.categorie_id) return false
          const txDate = new Date(t.date_transaction)
          if (b.periode === 'mensuel') {
            return txDate.getFullYear() === b.annee && txDate.getMonth() + 1 === b.mois
          }
          return txDate.getFullYear() === b.annee
        })
        .reduce((sum, t) => sum + Number(t.montant), 0)

      return {
        label: b.categorie_nom || `Cat ${b.categorie_id}`,
        budget: Number(b.montant_prevu),
        spent,
        exceeded: spent > b.montant_prevu
      }
    })

  const maxValue = Math.max(...chartData.flatMap(d => [d.budget, d.spent]), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
      {chartData.map((item, i) => {
        const budgetWidth = (item.budget / maxValue) * 100
        const spentWidth = (item.spent / maxValue) * 100
        const percentage = item.budget > 0 ? (item.spent / item.budget) * 100 : 0

        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.label}</span>
              <span style={{ fontSize: '0.85rem', color: item.exceeded ? '#c62828' : '#666' }}>
                {item.spent.toFixed(0)}€ / {item.budget.toFixed(0)}€ ({percentage.toFixed(0)}%)
              </span>
            </div>
            <div style={{ position: 'relative', height: '32px', background: '#f0f0f0', borderRadius: '6px', overflow: 'hidden' }}>
              {/* Barre budget (fond) */}
              <div style={{
                position: 'absolute',
                height: '100%',
                width: `${budgetWidth}%`,
                background: '#e0e0e0',
                borderRadius: '6px'
              }}></div>
              {/* Barre dépenses (par-dessus) */}
              <div style={{
                position: 'absolute',
                height: '100%',
                width: `${Math.min(spentWidth, 100)}%`,
                background: item.exceeded 
                  ? 'linear-gradient(90deg, #ef5350, #e53935)'
                  : percentage >= 80
                    ? 'linear-gradient(90deg, #ff9800, #f57c00)'
                    : 'linear-gradient(90deg, #66bb6a, #43a047)',
                borderRadius: '6px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Graphique circulaire des dépenses par catégorie
function CategoryPieChart({ transactions }) {
  const depensesByCategory = transactions
    .filter(t => t.type === 'depense' && t.categorie)
    .reduce((acc, t) => {
      const cat = t.categorie
      acc[cat] = (acc[cat] || 0) + Number(t.montant || 0)
      return acc
    }, {})

  const categories = Object.entries(depensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (categories.length === 0) {
    return <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>Aucune dépense par catégorie</div>
  }

  const total = categories.reduce((sum, [, val]) => sum + val, 0)
  const colors = ['#ef5350', '#ff9800', '#ffd54f', '#66bb6a', '#42a5f5']

  let currentAngle = 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {categories.map(([name, value], i) => {
          const percentage = (value / total) * 100
          const angle = (percentage / 100) * 360
          const startAngle = currentAngle
          currentAngle += angle

          // Convertir en radians
          const startRad = (startAngle - 90) * (Math.PI / 180)
          const endRad = (startAngle + angle - 90) * (Math.PI / 180)

          const x1 = 100 + 80 * Math.cos(startRad)
          const y1 = 100 + 80 * Math.sin(startRad)
          const x2 = 100 + 80 * Math.cos(endRad)
          const y2 = 100 + 80 * Math.sin(endRad)

          const largeArc = angle > 180 ? 1 : 0

          return (
            <path
              key={i}
              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={colors[i]}
              stroke="white"
              strokeWidth="2"
            />
          )
        })}
        {/* Cercle blanc au centre pour effet donut */}
        <circle cx="100" cy="100" r="50" fill="white" />
        <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="1.5rem" fontWeight="800" fill="#333">
          {total.toFixed(0)}€
        </text>
      </svg>

      {/* Légende */}
      <div style={{ display: 'grid', gap: '0.5rem', width: '100%' }}>
        {categories.map(([name, value], i) => {
          const percentage = (value / total) * 100
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors[i], flexShrink: 0 }}></div>
              <div style={{ flex: 1, fontSize: '0.85rem', color: '#666' }}>{name}</div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#333' }}>
                {value.toFixed(0)}€ ({percentage.toFixed(0)}%)
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

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
  ).slice(0, 3)

  // Données pour graphique d'évolution (6 derniers mois)
  const last6Months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    
    const monthTransactions = transactions.filter(t => {
      const txDate = new Date(t.date_transaction)
      return txDate.getMonth() + 1 === month && txDate.getFullYear() === year
    })

    const revenus = monthTransactions
      .filter(t => t.type === 'revenu')
      .reduce((sum, t) => sum + Number(t.montant), 0)
    
    const depenses = monthTransactions
      .filter(t => t.type === 'depense')
      .reduce((sum, t) => sum + Number(t.montant), 0)

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    
    last6Months.push({
      label: monthNames[month - 1],
      revenus,
      depenses
    })
  }

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

      {/* Graphiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Graphique d'évolution sur 6 mois */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          gridColumn: transactions.length > 5 ? 'span 2' : 'span 1'
        }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Évolution sur 6 mois</h3>
          <LineChart data={last6Months} />
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '3px', background: '#43a047', borderRadius: '2px' }}></div>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Revenus</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '3px', background: '#ef5350', borderRadius: '2px' }}></div>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Dépenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deuxième ligne de graphiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Graphique Budget vs Dépenses */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Budget vs Dépenses (ce mois)</h3>
          <BudgetComparisonChart budgets={budgets} transactions={transactions} />
        </div>

        {/* Graphique Dépenses par catégorie */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Dépenses par catégorie</h3>
          <CategoryPieChart transactions={transactions} />
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
