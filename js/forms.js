/* ============================================================
   forms.js — Fuel / Mod / Maintenance Forms & History
   ============================================================ */

import { state, getCarData, saveState } from './state.js';
import { fmt, escHtml, showStatus, showToast, showDetail, openModal, closeModal, openConfirm } from './utils.js';

// ============================================================
// TABS
// ============================================================
export function swTab(sec, tab, btn) {
  const formEl = document.getElementById(sec + '-form');
  const histEl = document.getElementById(sec + '-hist');
  btn.closest('.tab-row').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('at'));
  btn.classList.add('at');
  if (tab === 'form') {
    formEl.style.display = '';
    histEl.style.display = 'none';
  } else {
    formEl.style.display = 'none';
    histEl.style.display = '';
    renderHist(sec);
  }
}

// ============================================================
// HISTORY RENDER (clickable rows → detail popup)
// ============================================================
export function renderHist(sec) {
  if (!state.selectedCarId) return;
  const d  = getCarData(state.selectedCarId);
  const el = document.getElementById(sec + '-hist-list');

  if (sec === 'fuel') {
    const rows = [...d.fuel];
    if (!rows.length) { el.innerHTML = '<div class="empty">ยังไม่มีรายการ</div>'; return; }
    el.innerHTML = rows.map((r, i) => `
      <div class="hist-item hist-clickable" onclick="window._showFuelDetail(${i})">
        <div style="font-size:22px;line-height:1">⛽</div>
        <div class="hi">
          <div class="ht">${parseFloat(r.liters).toFixed(2)} ลิตร · ${r.ppl} บาท/ลิตร</div>
          <div class="hs">วันที่ ${r.date}</div>
        </div>
        <div class="ha ha-f">${fmt(r.total)}</div>
        <div class="hist-actions">
          <button class="hist-action-btn" onclick="event.stopPropagation();window._editHist('fuel',${i})" title="แก้ไข">✏️</button>
          <button class="hist-action-btn hist-action-del" onclick="event.stopPropagation();window._delHist('fuel',${i})" title="ลบ">🗑</button>
        </div>
      </div>`).join('');

    window._showFuelDetail = (i) => {
      const r = d.fuel[i];
      showDetail('⛽', `${parseFloat(r.liters).toFixed(2)} ลิตร`, `วันที่ ${r.date}`,
        `<div class="detail-grid">
          <div class="detail-row"><span>ราคา/ลิตร</span><strong>${r.ppl} บาท</strong></div>
          <div class="detail-row"><span>จำนวนลิตร</span><strong>${parseFloat(r.liters).toFixed(2)} ล.</strong></div>
          <div class="detail-row detail-total"><span>ยอดรวม</span><strong>${fmt(r.total)}</strong></div>
        </div>`);
    };

  } else if (sec === 'mod') {
    const rows = [...d.mod];
    if (!rows.length) { el.innerHTML = '<div class="empty">ยังไม่มีรายการ</div>'; return; }
    el.innerHTML = rows.map((r, i) => `
      <div class="hist-item hist-clickable" onclick="window._showModDetail(${i})">
        <div style="font-size:22px;line-height:1">🔧</div>
        <div class="hi">
          <div class="ht">${escHtml(r.item)}</div>
          <div class="hs">${r.date}${r.shop ? ' · ' + escHtml(r.shop) : ''}</div>
        </div>
        <div class="ha ha-m">${r.cost ? fmt(r.cost) : '—'}</div>
        <div class="hist-actions">
          <button class="hist-action-btn" onclick="event.stopPropagation();window._editHist('mod',${i})" title="แก้ไข">✏️</button>
          <button class="hist-action-btn hist-action-del" onclick="event.stopPropagation();window._delHist('mod',${i})" title="ลบ">🗑</button>
        </div>
      </div>`).join('');

    window._showModDetail = (i) => {
      const r = d.mod[i];
      showDetail('🔧', escHtml(r.item), `วันที่ ${r.date}`,
        `<div class="detail-grid">
          ${r.shop ? `<div class="detail-row"><span>ร้าน</span><strong>${escHtml(r.shop)}</strong></div>` : ''}
          ${r.cost ? `<div class="detail-row detail-total"><span>ราคา</span><strong>${fmt(r.cost)}</strong></div>` : ''}
          ${r.note ? `<div class="detail-row"><span>หมายเหตุ</span><strong>${escHtml(r.note)}</strong></div>` : ''}
          ${!r.shop && !r.cost && !r.note ? '<div class="detail-row"><span>ไม่มีรายละเอียดเพิ่มเติม</span></div>' : ''}
        </div>`);
    };

  } else {
    const rows = [...d.maint];
    if (!rows.length) { el.innerHTML = '<div class="empty">ยังไม่มีรายการ</div>'; return; }
    el.innerHTML = rows.map((r, i) => `
      <div class="hist-item hist-clickable" onclick="window._showMaintDetail(${i})">
        <div style="font-size:22px;line-height:1">⚙️</div>
        <div class="hi">
          <div class="ht">${escHtml(r.item)}</div>
          <div class="hs">${r.date}${r.shop ? ' · ' + escHtml(r.shop) : ''}</div>
        </div>
        <div class="ha ha-mn">${r.cost ? fmt(r.cost) : '—'}</div>
        <div class="hist-actions">
          <button class="hist-action-btn" onclick="event.stopPropagation();window._editHist('maint',${i})" title="แก้ไข">✏️</button>
          <button class="hist-action-btn hist-action-del" onclick="event.stopPropagation();window._delHist('maint',${i})" title="ลบ">🗑</button>
        </div>
      </div>`).join('');

    window._showMaintDetail = (i) => {
      const r = d.maint[i];
      showDetail('⚙️', escHtml(r.item), `วันที่ ${r.date}`,
        `<div class="detail-grid">
          ${r.shop ? `<div class="detail-row"><span>สถานที่</span><strong>${escHtml(r.shop)}</strong></div>` : ''}
          ${r.cost ? `<div class="detail-row detail-total"><span>ราคา</span><strong>${fmt(r.cost)}</strong></div>` : ''}
          ${r.note ? `<div class="detail-row"><span>หมายเหตุ</span><strong>${escHtml(r.note)}</strong></div>` : ''}
          ${!r.shop && !r.cost && !r.note ? '<div class="detail-row"><span>ไม่มีรายละเอียดเพิ่มเติม</span></div>' : ''}
        </div>`);
    };
  }
}

// ============================================================
// FUEL FORM
// ============================================================
export function calcFuel() {
  const ppl   = parseFloat(document.getElementById('f-ppl').value)   || 0;
  const total = parseFloat(document.getElementById('f-total').value) || 0;
  document.getElementById('calc-liters').textContent =
    (ppl > 0 && total > 0) ? (total / ppl).toFixed(2) + ' ลิตร' : '— ลิตร';
}

export function saveFuel() {
  const ppl   = document.getElementById('f-ppl').value;
  const date  = document.getElementById('f-date').value;
  const total = document.getElementById('f-total').value;

  if (!ppl || !date || !total) {
    showStatus('warning', 'กรุณากรอกข้อมูลให้ครบ', 'โปรดกรอกราคา/ลิตร, วันที่ และยอดเติมให้ครบทุกช่อง');
    return;
  }

  const liters = (parseFloat(total) / parseFloat(ppl)).toFixed(2);
  getCarData(state.selectedCarId).fuel.unshift({
    ppl: parseFloat(ppl).toFixed(2),
    date,
    total: parseFloat(total),
    liters,
  });
  saveState();
  showStatus('success', 'บันทึกสำเร็จ ✓', `เติมน้ำมัน ${liters} ลิตร รวม ฿${Math.round(parseFloat(total)).toLocaleString('th-TH')} บาท`);
  document.getElementById('f-ppl').value   = '';
  document.getElementById('f-total').value = '';
  document.getElementById('f-date').valueAsDate = new Date();
  calcFuel();
}

// ============================================================
// MOD FORM
// ============================================================
export function saveMod() {
  const date = document.getElementById('m-date').value;
  const item = document.getElementById('m-item').value.trim();
  if (!date || !item) {
    showStatus('warning', 'กรุณากรอกข้อมูลให้ครบ', 'โปรดระบุวันที่และของที่แต่ง');
    return;
  }

  getCarData(state.selectedCarId).mod.unshift({
    date,
    item,
    shop: document.getElementById('m-shop').value.trim(),
    cost: document.getElementById('m-cost').value,
    note: document.getElementById('m-note').value.trim(),
  });
  saveState();
  showStatus('success', 'บันทึกสำเร็จ ✓', `"${item}" ถูกบันทึกเรียบร้อยแล้ว`);
  ['m-item', 'm-shop', 'm-cost', 'm-note'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('m-date').valueAsDate = new Date();
}

// ============================================================
// MAINTENANCE FORM
// ============================================================
export function saveMaint() {
  const date = document.getElementById('mn-date').value;
  const item = document.getElementById('mn-item').value.trim();
  if (!date || !item) {
    showStatus('warning', 'กรุณากรอกข้อมูลให้ครบ', 'โปรดระบุวันที่และสิ่งที่ทำ');
    return;
  }

  getCarData(state.selectedCarId).maint.unshift({
    date,
    item,
    shop: document.getElementById('mn-shop').value.trim(),
    cost: document.getElementById('mn-cost').value,
    note: document.getElementById('mn-note').value.trim(),
  });
  saveState();
  showStatus('success', 'บันทึกสำเร็จ ✓', `"${item}" ถูกบันทึกเรียบร้อยแล้ว`);
  ['mn-item', 'mn-shop', 'mn-cost', 'mn-note'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('mn-date').valueAsDate = new Date();
}

// ============================================================
// EDIT / DELETE HISTORY ITEMS (ต้อง Login แอดมินก่อนเสมอ — ดู auth.js)
// ============================================================
const HIST_META = {
  fuel:  { icon: '⛽', label: 'รายการเติมน้ำมัน' },
  mod:   { icon: '🔧', label: 'รายการแต่งรถ' },
  maint: { icon: '⚙️', label: 'รายการบำรุงรักษา' },
};

export function askEditHist(type, i) {
  if (!state.selectedCarId) return;
  const d = getCarData(state.selectedCarId);
  const r = (d[type] || [])[i];
  if (!r) return;

  document.getElementById('he-type').value  = type;
  document.getElementById('he-index').value = i;

  const fieldsEl = document.getElementById('he-fields');
  const titleEl  = document.getElementById('he-title');
  const meta     = HIST_META[type];

  if (type === 'fuel') {
    titleEl.textContent = `${meta.icon} แก้ไขรายการเติมน้ำมัน`;
    fieldsEl.innerHTML = `
      <div class="form-group">
        <label class="form-label">ราคาน้ำมันวันนั้น (บาท/ลิตร) *</label>
        <input class="form-input" type="number" step="0.01" id="he-ppl" oninput="window._calcEditFuel()"/>
      </div>
      <div class="form-group">
        <label class="form-label">วันที่เติม *</label>
        <input class="form-input" type="date" id="he-date"/>
      </div>
      <div class="form-group">
        <label class="form-label">ราคาที่เติม (บาท) *</label>
        <input class="form-input" type="number" step="0.01" id="he-total" oninput="window._calcEditFuel()"/>
      </div>
      <div class="calc-box">
        <span class="calc-lbl">💧 ได้น้ำมัน</span>
        <span class="calc-val" id="he-calc-liters">— ลิตร</span>
      </div>
    `;
    document.getElementById('he-ppl').value   = r.ppl;
    document.getElementById('he-date').value  = r.date;
    document.getElementById('he-total').value = r.total;
    calcEditFuel();
  } else {
    const itemLabel = type === 'mod' ? 'ของที่แต่ง' : 'สิ่งที่ทำ';
    const shopLabel  = type === 'mod' ? 'แต่งที่ไหน'  : 'ที่ไหน';
    titleEl.textContent = `${meta.icon} แก้ไข${meta.label}`;
    fieldsEl.innerHTML = `
      <div class="form-group">
        <label class="form-label">วันที่ *</label>
        <input class="form-input" type="date" id="he-date"/>
      </div>
      <div class="form-group">
        <label class="form-label">${itemLabel} *</label>
        <input class="form-input" type="text" id="he-item"/>
      </div>
      <div class="form-group">
        <label class="form-label">${shopLabel}</label>
        <input class="form-input" type="text" id="he-shop"/>
      </div>
      <div class="form-group">
        <label class="form-label">ราคา (บาท)</label>
        <input class="form-input" type="number" step="0.01" id="he-cost"/>
      </div>
      <div class="form-group">
        <label class="form-label">รายละเอียดเพิ่มเติม</label>
        <input class="form-input" type="text" id="he-note"/>
      </div>
    `;
    document.getElementById('he-date').value = r.date;
    document.getElementById('he-item').value = r.item;
    document.getElementById('he-shop').value = r.shop || '';
    document.getElementById('he-cost').value = r.cost || '';
    document.getElementById('he-note').value = r.note || '';
  }

  openModal('modal-hist-edit');
}

export function calcEditFuel() {
  const ppl   = parseFloat(document.getElementById('he-ppl').value)   || 0;
  const total = parseFloat(document.getElementById('he-total').value) || 0;
  document.getElementById('he-calc-liters').textContent =
    (ppl > 0 && total > 0) ? (total / ppl).toFixed(2) + ' ลิตร' : '— ลิตร';
}

export function saveEditHist() {
  const type = document.getElementById('he-type').value;
  const i    = parseInt(document.getElementById('he-index').value);
  const d    = getCarData(state.selectedCarId);
  const r    = (d[type] || [])[i];
  if (!r) return;

  if (type === 'fuel') {
    const ppl   = document.getElementById('he-ppl').value;
    const date  = document.getElementById('he-date').value;
    const total = document.getElementById('he-total').value;
    if (!ppl || !date || !total) {
      showStatus('warning', 'กรุณากรอกข้อมูลให้ครบ', 'โปรดกรอกราคา/ลิตร, วันที่ และยอดเติมให้ครบทุกช่อง');
      return;
    }
    r.ppl    = parseFloat(ppl).toFixed(2);
    r.date   = date;
    r.total  = parseFloat(total);
    r.liters = (parseFloat(total) / parseFloat(ppl)).toFixed(2);
  } else {
    const date = document.getElementById('he-date').value;
    const item = document.getElementById('he-item').value.trim();
    if (!date || !item) {
      showStatus('warning', 'กรุณากรอกข้อมูลให้ครบ', 'โปรดระบุวันที่และรายละเอียดให้ครบ');
      return;
    }
    r.date = date;
    r.item = item;
    r.shop = document.getElementById('he-shop').value.trim();
    r.cost = document.getElementById('he-cost').value;
    r.note = document.getElementById('he-note').value.trim();
  }

  saveState();
  closeModal('modal-hist-edit');
  renderHist(type);
  showStatus('success', 'แก้ไขสำเร็จ', 'รายการถูกอัปเดตเรียบร้อยแล้ว');
}

export function askDelHist(type, i) {
  const meta = HIST_META[type] || { label: 'รายการ' };
  openConfirm(
    'ลบรายการนี้?',
    `${meta.label}นี้จะถูกลบถาวรและไม่สามารถกู้คืนได้`,
    () => doDeleteHist(type, i)
  );
}

function doDeleteHist(type, i) {
  const d = getCarData(state.selectedCarId);
  if (!d[type]) return;
  d[type].splice(i, 1);
  saveState();
  renderHist(type);
  showToast('ลบรายการแล้ว');
}
