/* ============================================================
   analytics.js — Analytics Dashboard Page
   ============================================================ */

import { state, getCarData } from './state.js';
import { fmt, escHtml } from './utils.js';

export function renderAnalytics() {
  // Populate car selector
  const carSel = document.getElementById('an-car');
  const savedCarId = carSel.value;
  carSel.innerHTML = state.cars.map(c =>
    `<option value="${c.id}">${escHtml(c.name)}${c.plate ? ' · ' + escHtml(c.plate) : ''}</option>`
  ).join('');
  if (savedCarId && state.cars.find(c => c.id == savedCarId)) {
    carSel.value = savedCarId;
  } else if (state.selectedCarId) {
    carSel.value = state.selectedCarId;
  }

  // Default month = current
  const monthEl = document.getElementById('an-month');
  if (!monthEl.value) {
    const now = new Date();
    monthEl.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  }

  const carId = parseInt(carSel.value);
  const monthVal = monthEl.value; // "YYYY-MM"
  if (!carId || !monthVal) return;

  const car = state.cars.find(c => c.id === carId);
  if (!car) return;

  const d = getCarData(carId);
  const [yr, mo] = monthVal.split('-').map(Number);
  const monthNames = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
                      'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  // Filter by month
  const inMonth = (dateStr) => {
    if (!dateStr) return false;
    const [y, m] = dateStr.split('-').map(Number);
    return y === yr && m === mo;
  };

  const fuelRows  = d.fuel.filter(r  => inMonth(r.date));
  const maintRows = d.maint.filter(r => inMonth(r.date));
  const modRows   = d.mod.filter(r   => inMonth(r.date));

  const fuelTotal  = fuelRows.reduce((s, r)  => s + (parseFloat(r.total) || 0), 0);
  const maintTotal = maintRows.reduce((s, r) => s + (parseFloat(r.cost) || 0), 0);
  const modTotal   = modRows.reduce((s, r)   => s + (parseFloat(r.cost) || 0), 0);
  const grandTotal = fuelTotal + maintTotal + modTotal;

  const body = document.getElementById('analytics-body');

  body.innerHTML = `
    <div class="an-period">${monthNames[mo]} ${yr}</div>

    <div class="an-stats">
      <div class="an-stat an-fuel">
        <div class="an-stat-icon">⛽</div>
        <div class="an-stat-label">น้ำมัน</div>
        <div class="an-stat-val">${fmt(fuelTotal)}</div>
        <div class="an-stat-count">${fuelRows.length} ครั้ง</div>
      </div>
      <div class="an-stat an-maint">
        <div class="an-stat-icon">⚙️</div>
        <div class="an-stat-label">บำรุงรักษา</div>
        <div class="an-stat-val">${fmt(maintTotal)}</div>
        <div class="an-stat-count">${maintRows.length} รายการ</div>
      </div>
      <div class="an-stat an-mod">
        <div class="an-stat-icon">🔧</div>
        <div class="an-stat-label">แต่งรถ</div>
        <div class="an-stat-val">${fmt(modTotal)}</div>
        <div class="an-stat-count">${modRows.length} รายการ</div>
      </div>
    </div>

    <div class="an-total-box">
      <span class="an-total-lbl">รวมค่าใช้จ่าย</span>
      <span class="an-total-val">${fmt(grandTotal)}</span>
    </div>

    ${fuelRows.length ? `
    <div class="lbl" style="margin-top:1.25rem">⛽ รายการเติมน้ำมัน</div>
    ${fuelRows.map(r => `
      <div class="an-row">
        <div class="an-row-info">
          <div class="an-row-title">${parseFloat(r.liters).toFixed(2)} ลิตร · ${r.ppl} บ./ล.</div>
          <div class="an-row-date">${r.date}</div>
        </div>
        <div class="an-row-val an-f">${fmt(r.total)}</div>
      </div>`).join('')}
    ` : ''}

    ${maintRows.length ? `
    <div class="lbl" style="margin-top:1.25rem">⚙️ รายการบำรุงรักษา</div>
    ${maintRows.map(r => `
      <div class="an-row">
        <div class="an-row-info">
          <div class="an-row-title">${escHtml(r.item)}</div>
          <div class="an-row-date">${r.date}${r.shop ? ' · ' + escHtml(r.shop) : ''}</div>
        </div>
        <div class="an-row-val an-mn">${r.cost ? fmt(r.cost) : '—'}</div>
      </div>`).join('')}
    ` : ''}

    ${modRows.length ? `
    <div class="lbl" style="margin-top:1.25rem">🔧 รายการแต่งรถ</div>
    ${modRows.map(r => `
      <div class="an-row">
        <div class="an-row-info">
          <div class="an-row-title">${escHtml(r.item)}</div>
          <div class="an-row-date">${r.date}${r.shop ? ' · ' + escHtml(r.shop) : ''}</div>
        </div>
        <div class="an-row-val an-m">${r.cost ? fmt(r.cost) : '—'}</div>
      </div>`).join('')}
    ` : ''}

    ${grandTotal === 0 ? '<div class="empty">ไม่มีข้อมูลในเดือนนี้</div>' : ''}
  `;
}
