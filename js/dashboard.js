/* ============================================================
   dashboard.js — Dashboard Stats & Recent Activity
   ============================================================ */

import { state, getCarData } from './state.js';
import { fmt, escHtml } from './utils.js';

export function updateDash() {
  if (!state.selectedCarId) return;
  const d   = getCarData(state.selectedCarId);
  const now = new Date();
  const mo  = now.getMonth();
  const yr  = now.getFullYear();

  // Fuel this month
  const fuelMo = d.fuel
    .filter(r => {
      const dt = new Date(r.date);
      return dt.getMonth() === mo && dt.getFullYear() === yr;
    })
    .reduce((s, r) => s + (parseFloat(r.total) || 0), 0);

  const modTotal   = d.mod.reduce((s, r)   => s + (parseFloat(r.cost) || 0), 0);
  const maintTotal = d.maint.reduce((s, r) => s + (parseFloat(r.cost) || 0), 0);

  document.getElementById('st-fuel').textContent  = fmt(fuelMo);
  document.getElementById('st-mod').textContent   = fmt(modTotal);
  document.getElementById('st-maint').textContent = fmt(maintTotal);

  // Recent items (latest 6, sorted by date)
  const all = [
    ...d.fuel.map(r => ({
      dot: 'df',
      title: `เติม ${parseFloat(r.liters).toFixed(2)} ล. (${r.ppl} บ./ล.)`,
      date: r.date,
      val: fmt(r.total),
    })),
    ...d.mod.map(r => ({
      dot: 'dm',
      title: r.item,
      date: r.date,
      val: r.cost ? fmt(r.cost) : '—',
    })),
    ...d.maint.map(r => ({
      dot: 'dmn',
      title: r.item,
      date: r.date,
      val: r.cost ? fmt(r.cost) : '—',
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const con = document.getElementById('home-recent');
  if (!all.length) {
    con.innerHTML = '<div class="empty">ยังไม่มีรายการ เริ่มบันทึกข้อมูลได้เลย</div>';
    return;
  }
  con.innerHTML = all.map(it => `
    <div class="rrow">
      <div class="rdot ${it.dot}"></div>
      <div class="ri">
        <div class="rt">${escHtml(it.title)}</div>
        <div class="rd">${it.date}</div>
      </div>
      <div class="rv">${it.val}</div>
    </div>
  `).join('');
}
