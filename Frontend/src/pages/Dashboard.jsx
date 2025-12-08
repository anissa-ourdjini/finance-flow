import React, { useEffect, useState } from 'react'
import { apiGetTransactions, apiGetBudgets } from '../api'

export default function Dashboard(){
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])

  useEffect(()=>{
    apiGetTransactions().then(r => { if(r && r.data && r.data.transactions) setTransactions(r.data.transactions) })
    apiGetBudgets().then(r => { if(r && r.data && r.data.budgets) setBudgets(r.data.budgets) })
  }, [])

  const totalSpent = transactions.reduce((s,t) => s + (Number(t.montant||t.amount||0)), 0)
  const income = transactions.length>0 && transactions[0].income ? Number(transactions[0].income) : 0

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h2>Tableau de bord</h2>
        <div className="summary">
          <div className="card">
            <h3>Revenu estimé</h3>
            <p className="big">{income ? `${income} €` : '—'}</p>
          </div>
          <div className="card">
            <h3>Dépensé</h3>
            <p className="big">{totalSpent.toFixed(2)} €</p>
          </div>
          <div className="card">
            <h3>Budgets</h3>
            <p className="big">{budgets.length}</p>
          </div>
        </div>
      </header>

      <section>
        <h3>Dernières transactions</h3>
        <table className="tx-table">
          <thead><tr><th>Date</th><th>Titre</th><th>Catégorie</th><th>Montant</th></tr></thead>
          <tbody>
            {transactions.slice(0,10).map(tx => (
              <tr key={tx.id || tx.titre + tx.date_transaction}>
                <td>{tx.date_transaction || tx.date}</td>
                <td>{tx.titre || tx.title}</td>
                <td>{tx.categorie || tx.category}</td>
                <td>{(Number(tx.montant||tx.amount)||0).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
