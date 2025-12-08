import React, { useEffect, useState } from 'react'
import { apiGetTransactions, apiAddTransaction, apiDeleteTransaction } from '../api'

export default function Transactions(){
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState({ titre:'', montant:'', categorie:'', date_transaction: '' })
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ load() }, [])
  function load(){ apiGetTransactions().then(r => { if(r && r.data && r.data.transactions) setTransactions(r.data.transactions) }) }

  async function add(e){
    e.preventDefault(); setLoading(true)
    const tx = { titre: form.titre, montant: Number(form.montant||0), date_transaction: form.date_transaction || new Date().toISOString(), type:'depense' }
    const res = await apiAddTransaction(tx)
    setLoading(false)
    if(res.ok && res.data && res.data.ok){ load(); setForm({ titre:'', montant:'', categorie:'', date_transaction:'' }) }
    else alert('Erreur ajout')
  }

  async function del(id){ if(!confirm('Supprimer cette transaction ?')) return; const r = await apiDeleteTransaction(id); if(r.ok) load(); }

  return (
    <div>
      <h2>Transactions</h2>
      <form onSubmit={add} className="tx-form">
        <input placeholder="Titre" value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} required />
        <input placeholder="Montant" type="number" value={form.montant} onChange={e=>setForm({...form,montant:e.target.value})} required />
        <input placeholder="Date" type="datetime-local" value={form.date_transaction} onChange={e=>setForm({...form,date_transaction:e.target.value})} />
        <button type="submit" disabled={loading}>Ajouter</button>
      </form>

      <table className="tx-table">
        <thead><tr><th>Date</th><th>Titre</th><th>Montant</th><th></th></tr></thead>
        <tbody>
          {transactions.map(tx=> (
            <tr key={tx.id}>
              <td>{tx.date_transaction}</td>
              <td>{tx.titre}</td>
              <td>{(Number(tx.montant)||0).toFixed(2)} €</td>
              <td><button onClick={()=>del(tx.id)}>Suppr</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
