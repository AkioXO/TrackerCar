/* ============================================================
   chart.js — Monthly Expense Bar Chart (Chart.js)
   ============================================================ */

import { state, getCarData } from './state.js';

let chartInstance = null;

export function renderChart() {
  if (!state.selectedCarId) return;
  const d     = getCarData(state.selectedCarId);
  const yrSel = document.getElementById('chart-year');

  const years = new Set([new Date().getFullYear().toString()]);
  [...d.fuel, ...d.mod, ...d.maint].forEach(r => {
    if (r.date) years.add(r.date.slice(0, 4));
  });
  const sortedYears = [...years].sort().reverse();

  const curOpts = [...yrSel.options].map(o => o.value).join(',');
  if (curOpts !== sortedYears.join(',')) {
    yrSel.innerHTML = sortedYears
      .map(y => `<option value="${y}">${y}</option>`)
      .join('');
  }
  const selY = yrSel.value || new Date().getFullYear().toString();

  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
                  'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const fuelM  = Array(12).fill(0);
  const modM   = Array(12).fill(0);
  const maintM = Array(12).fill(0);

  d.fuel.forEach(r => {
    if (r.date && r.date.startsWith(selY))
      fuelM[parseInt(r.date.slice(5, 7)) - 1] += parseFloat(r.total) || 0;
  });
  d.mod.forEach(r => {
    if (r.date && r.date.startsWith(selY))
      modM[parseInt(r.date.slice(5, 7)) - 1] += parseFloat(r.cost) || 0;
  });
  d.maint.forEach(r => {
    if (r.date && r.date.startsWith(selY))
      maintM[parseInt(r.date.slice(5, 7)) - 1] += parseFloat(r.cost) || 0;
  });

  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById('expense-chart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'น้ำมัน',      data: fuelM.map(v => Math.round(v)),  backgroundColor: '#eda100', borderRadius: 3, borderSkipped: false },
        { label: 'แต่งรถ',      data: modM.map(v => Math.round(v)),   backgroundColor: '#4a3aa7', borderRadius: 3, borderSkipped: false },
        { label: 'บำรุงรักษา', data: maintM.map(v => Math.round(v)), backgroundColor: '#1baf7a', borderRadius: 3, borderSkipped: false },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx =>
              `${ctx.dataset.label}: ฿${Math.round(ctx.parsed.y).toLocaleString('th-TH')}`,
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: { display: false },
          ticks: { font: { size: 10 }, autoSkip: false, maxRotation: 0 },
        },
        y: {
          stacked: false,
          grid: { color: 'rgba(128,128,128,.1)' },
          ticks: {
            font: { size: 10 },
            callback: v => v >= 1000 ? '฿' + (v / 1000).toFixed(0) + 'k' : '฿' + v,
          },
          beginAtZero: true,
        },
      },
    },
  });
}
