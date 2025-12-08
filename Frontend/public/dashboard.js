// Dashboard page logic
(function(){
  const B = window.Budget;
  if(!B) return;

  const totalSpentEl = document.getElementById('totalSpent');
  const incomeValEl = document.getElementById('incomeVal');
  const funValEl = document.getElementById('funVal');
  const funProgressEl = document.getElementById('funProgress') ? document.getElementById('funProgress').querySelector('.progress-fill') : null;
  const categoryListEl = document.getElementById('categoryList');
  const addTxBtn = document.getElementById('addTxBtn');
  const modal = document.getElementById('modal');
  const saveTx = document.getElementById('saveTx');
  const cancelTx = document.getElementById('cancelTx');
  const txTitle = document.getElementById('txTitle');
  const txAmount = document.getElementById('txAmount');
  const txCategory = document.getElementById('txCategory');

  function computeAndRender(){
    const {totals, totalSpent} = B.computeTotals();
    if(totalSpentEl) totalSpentEl.textContent = `${totalSpent.toFixed(2)} €`;
    if(incomeValEl) incomeValEl.textContent = B.state.income.toFixed(0);
    if(funValEl) funValEl.textContent = totalSpent.toFixed(0);
    if(funProgressEl) {
      const pct = Math.min(100, (totalSpent / B.state.income) * 100);
      funProgressEl.style.width = pct + '%';
    }

    if(categoryListEl){
      categoryListEl.innerHTML = '';
      B.DEFAULT_CATEGORIES.forEach(cat => {
        const li = document.createElement('li');
        const left = document.createElement('div');
        left.style.display = 'flex'; left.style.alignItems = 'center'; left.style.gap = '10px';
        const dot = document.createElement('span');
        dot.style.display='inline-block';dot.style.width='34px';dot.style.height='34px';dot.style.borderRadius='50%';dot.style.background=cat.color;dot.style.flex='0 0 34px';
        const name = document.createElement('div');name.textContent = cat.name;name.style.color='#526f6d';
        left.appendChild(dot);left.appendChild(name);
        const price = document.createElement('div');price.textContent = `${(totals[cat.name]||0).toFixed(0)} €`;price.style.color='#293b39';
        li.appendChild(left);li.appendChild(price);
        categoryListEl.appendChild(li);
      });
    }
  }

  // modal handlers
  if(addTxBtn && modal){
    addTxBtn.addEventListener('click', ()=> modal.classList.remove('hidden'));
  }
  // nav Add / Settings wiring
  const navAdd = document.getElementById('navAdd');
  const navSettings = document.getElementById('navSettings');
  if(navAdd && modal) navAdd.addEventListener('click', (e)=>{ e.preventDefault(); modal.classList.remove('hidden'); });
  if(navSettings){ navSettings.addEventListener('click', ()=> { window.location.href = 'settings.html'; }); }
  if(cancelTx && modal){
    cancelTx.addEventListener('click', ()=> { modal.classList.add('hidden'); clearModal(); });
  }
  if(saveTx){
    saveTx.addEventListener('click', ()=>{
      const title = txTitle.value.trim() || 'Tx';
      const amount = parseFloat(txAmount.value);
      const category = txCategory.value;
      if(!amount || amount <= 0){ alert('Veuillez entrer un montant positif'); return; }
      B.addTransaction({title, amount, category, date: new Date().toISOString()});
      modal.classList.add('hidden'); clearModal(); computeAndRender();
    });
  }

  function clearModal(){ if(txTitle) txTitle.value=''; if(txAmount) txAmount.value=''; if(txCategory) txCategory.value='Snacks'; }

  // initial render
  computeAndRender();

  // expose a small updater for other pages
  window.DashboardUI = { refresh: computeAndRender };
})();
