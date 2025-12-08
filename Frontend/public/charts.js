// Charts page logic
(function(){
  const B = window.Budget;
  if(!B) return;
  const ctxEl = document.getElementById('donutChart');
  const totalSpentEl = document.getElementById('totalSpent');
  let donutChart = null;

  function render(){
    const {totals, totalSpent} = B.computeTotals();
    if(totalSpentEl) totalSpentEl.textContent = `${totalSpent.toFixed(2)} €`;
    const labels = B.DEFAULT_CATEGORIES.map(c => c.name);
    const data = B.DEFAULT_CATEGORIES.map(c => totals[c.name]||0);
    const colors = B.DEFAULT_CATEGORIES.map(c => c.color);

    if(!ctxEl) return;
    const ctx = ctxEl.getContext('2d');
    if(!donutChart){
      donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets:[{ data, backgroundColor: colors, borderWidth:0 }] },
        options: { responsive:true, maintainAspectRatio:true, cutout:'70%', plugins:{legend:{display:false}} }
      });
    } else {
      donutChart.data.datasets[0].data = data;
      donutChart.update();
    }
  }

  render();
  // expose for external update
  window.ChartsUI = { render };
})();
