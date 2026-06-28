/* ============================================================
   cars.js — Car Select Page Logic
   ============================================================ */

import { state, saveState, COLOR_MAP } from './state.js';
import { escHtml, escAttr, showToast, showStatus, openModal, closeModal, openConfirm } from './utils.js';
import { goTo } from './router.js';

export function renderCars() {
  const grid = document.getElementById('car-grid');
  grid.innerHTML = '';

  state.cars.forEach(car => {
    const cm = COLOR_MAP[car.color] || COLOR_MAP.warning;

    const card = document.createElement('div');
    card.className = 'car-card';
    card.innerHTML = `
      <div class="car-av" style="background:${cm.bg};color:${cm.color}">
        🚗
        ${car.photo ? `<img class="car-av-img" src="${escHtml(car.photo)}" alt="" onerror="this.remove()">` : ''}
      </div>
      <div class="car-name">${escHtml(car.name)}</div>
      <div class="car-plate">${escHtml(car.plate || '—')}</div>
      <div class="car-actions">
        <button class="car-action-btn car-edit-btn"
          onclick="event.stopPropagation();window._askEdit(${car.id})"
          title="แก้ไข">✏️</button>
        <button class="car-action-btn car-del-btn"
          onclick="event.stopPropagation();window._askDel(${car.id},'${escAttr(car.name)}')"
          title="ลบรถ">🗑</button>
      </div>
      <div class="car-enter-hint">คลิกเพื่อเข้าใช้งาน ›</div>
    `;
    card.addEventListener('click', () => enterCar(car.id));
    grid.appendChild(card);
  });

  // Add car button
  const addBtn = document.createElement('button');
  addBtn.className = 'add-car-btn';
  addBtn.onclick = () => {
    document.getElementById('nc-name').value  = '';
    document.getElementById('nc-plate').value = '';
    document.getElementById('nc-color').value = 'warning';
    document.getElementById('nc-photo').value = '';
    resetPreview('nc');
    openModal('modal-add');
  };
  addBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8"  y1="12" x2="16" y2="12"/>
    </svg>
    <span>เพิ่มรถ</span>
  `;
  grid.appendChild(addBtn);
}

/* ===== Photo URL preview (Add/Edit car modals) =====
   prefix = 'nc' (add) | 'ec' (edit)
   ใช้ token กันปัญหา race condition: ถ้าผู้ใช้พิมพ์ URL ใหม่เร็ว ๆ
   ผลของ URL เก่าที่โหลดช้ากว่าจะไม่ทับผลของ URL ใหม่ */
const previewToken = {};

export function previewPhoto(prefix) {
  const url = document.getElementById(`${prefix}-photo`).value.trim();
  if (!url) { resetPreview(prefix); return; }

  const myToken = (previewToken[prefix] = (previewToken[prefix] || 0) + 1);
  const preview  = document.getElementById(`${prefix}-photo-preview`);

  const img = new Image();
  img.onload = () => {
    if (previewToken[prefix] !== myToken) return; // ผลลัพธ์เก่า ไม่ใช้แล้ว
    preview.innerHTML = `<img src="${escHtml(url)}" alt=""/>`;
    preview.classList.add('has-img');
  };
  img.onerror = () => {
    if (previewToken[prefix] !== myToken) return; // ผลลัพธ์เก่า ไม่ใช้แล้ว
    preview.innerHTML = '⚠️';
    preview.classList.remove('has-img');
  };
  img.src = url;
}

function resetPreview(prefix) {
  previewToken[prefix] = (previewToken[prefix] || 0) + 1; // ยกเลิกผลลัพธ์ที่รออยู่
  const preview = document.getElementById(`${prefix}-photo-preview`);
  preview.innerHTML = '🚗';
  preview.classList.remove('has-img');
}

function enterCar(carId) {
  const car = state.cars.find(c => c.id === carId);
  if (!car) return;
  state.selectedCarId = carId;
  saveState();
  // Update labels
  document.getElementById('dash-title').textContent = car.name;
  document.getElementById('dash-sub').textContent   = car.plate || '';
  document.getElementById('fuel-sub').textContent   = car.name;
  document.getElementById('mod-sub').textContent    = car.name;
  document.getElementById('maint-sub').textContent  = car.name;
  goTo('page-home');
}

export function saveNewCar() {
  const name = document.getElementById('nc-name').value.trim();
  if (!name) {
    showStatus('warning', 'กรุณากรอกข้อมูล', 'โปรดใส่ชื่อรถก่อนบันทึก');
    return;
  }
  const plate = document.getElementById('nc-plate').value.trim();
  const color = document.getElementById('nc-color').value;
  const photo = document.getElementById('nc-photo').value.trim();
  state.cars.push({ id: state.nextId++, name, plate, color, photo });
  saveState();
  closeModal('modal-add');
  renderCars();
  showStatus('success', 'เพิ่มรถสำเร็จ', `"${name}" ถูกเพิ่มเรียบร้อยแล้ว`);
}

export function askEdit(id) {
  const car = state.cars.find(c => c.id === id);
  if (!car) return;
  document.getElementById('ec-id').value    = id;
  document.getElementById('ec-name').value  = car.name;
  document.getElementById('ec-plate').value = car.plate || '';
  document.getElementById('ec-color').value = car.color;
  document.getElementById('ec-photo').value = car.photo || '';
  previewPhoto('ec');
  openModal('modal-edit');
}

export function saveEditCar() {
  const id   = parseInt(document.getElementById('ec-id').value);
  const name = document.getElementById('ec-name').value.trim();
  if (!name) {
    showStatus('warning', 'กรุณากรอกข้อมูล', 'โปรดใส่ชื่อรถก่อนบันทึก');
    return;
  }
  const car = state.cars.find(c => c.id === id);
  if (!car) return;
  car.name  = name;
  car.plate = document.getElementById('ec-plate').value.trim();
  car.color = document.getElementById('ec-color').value;
  car.photo = document.getElementById('ec-photo').value.trim();
  saveState();
  closeModal('modal-edit');
  renderCars();
  // Update labels if this is the selected car
  if (state.selectedCarId === id) {
    document.getElementById('dash-title').textContent = car.name;
    document.getElementById('dash-sub').textContent   = car.plate || '';
    document.getElementById('fuel-sub').textContent   = car.name;
    document.getElementById('mod-sub').textContent    = car.name;
    document.getElementById('maint-sub').textContent  = car.name;
  }
  showStatus('success', 'แก้ไขสำเร็จ', `ข้อมูล "${name}" ถูกอัปเดตแล้ว`);
}

export function askDel(id, name) {
  openConfirm(
    'ลบรถนี้?',
    `"${name}" และข้อมูลทั้งหมดจะถูกลบถาวร`,
    () => doDeleteCar(id)
  );
}

function doDeleteCar(id) {
  state.cars = state.cars.filter(c => c.id !== id);
  delete state.data[id];
  if (state.selectedCarId === id) {
    state.selectedCarId = null;
  }
  saveState();
  renderCars();
  showToast('ลบรถแล้ว');
}

// selectCar kept for compatibility but not exposed as a button
export function selectCar() {
  if (!state.selectedCarId) return;
  enterCar(state.selectedCarId);
}
