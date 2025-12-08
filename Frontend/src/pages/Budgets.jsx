import React, { useEffect, useState } from 'react'
import { apiGetBudgets, apiAddBudget } from '../api'

export default function Budgets(){
  const [budgets, setBudgets] = useState([])
  const [form, setForm] = useState({ categorie_id:'', montant_prevu:'' })

  useEffect(()=>{ apiGetBudgets().then(r=>{ if(r && r.data && r.data.budgets) setBudgets(r.data.budgets) }) }, [])

  async function add(e){ e.preventDefault(); const res = await apiAddBudget({ categorie_id: form.categorie_id, montant_prevu: Number(form.montant_prevu||0) }); if(res.ok && res.data && res.data.ok){ apiGetBudgets().then(r=>setBudgets(r.data.budgets)); setForm({categorie_id:'', montant_prevu:''}) } else alert('Erreur'); }

  return (
    <div>
      <h2>Budgets</h2>
      <form onSubmit={add} className="budget-form">
        <input placeholder="Categorie (id)" value={form.categorie_id} onChange={e=>setForm({...form,categorie_id:e.target.value})} required />
        <input placeholder="Montant prévu" type="number" value={form.montant_prevu} onChange={e=>setForm({...form,montant_prevu:e.target.value})} required />
        <button type="submit">Ajouter budget</button>
      </form>

      <ul>
        {budgets.map(b=> <li key={b.id}>{b.categorie || b.categorie_id}: {b.montant_prevu} ({b.periode})</li>)}
      </ul>
    </div>
  )
}
