/* ============================================================
   auth.js — Admin Login (PIN Pad) & Access Control
   ------------------------------------------------------------
   - ปุ่มแก้ไข/ลบ (รถ และ ประวัติ) ทุกตัวเรียกผ่าน requireAdmin()
   - ถ้ายังไม่ Login จะเด้งหน้า PIN pad ขึ้นมาก่อนเสมอ
   - Login จะอยู่ได้ตลอด "เซสชันของแท็บ" (sessionStorage) จนกว่าจะ
     ออกจากระบบ หรือปิดแท็บ/เบราว์เซอร์
   ============================================================ */

import { state, saveState } from './state.js';
import { openModal, closeModal, showToast, showStatus } from './utils.js';

const SESSION_KEY  = 'mycar_admin_session';
const PIN_LENGTH   = 4;
const DEFAULT_PIN  = '1234';

let isAdmin       = sessionStorage.getItem(SESSION_KEY) === '1';
let pinBuffer      = '';
let pendingAction = null;     // action ที่รออยู่ ถ้า login สำเร็จจะรันต่อทันที
let mode           = 'login';  // 'login' | 'setNew' | 'confirmNew'
let firstNewPin   = '';

export function isAdminLoggedIn() {
  return isAdmin;
}

/* เรียกฟังก์ชันใด ๆ ที่ต้องมีสิทธิ์แอดมินก่อนเสมอ
   - login อยู่แล้ว -> รันทันที
   - ยังไม่ login -> เปิดหน้า PIN pad แล้วรันให้หลัง login สำเร็จ */
export function requireAdmin(action) {
  if (isAdmin) {
    action();
    return;
  }
  pendingAction = action;
  mode = 'login';
  pinBuffer = '';
  renderPinUI('🔒 เข้าสู่ระบบแอดมิน', 'กรอกรหัส PIN เพื่อแก้ไข/ลบข้อมูล');
  document.getElementById('pin-cancel-btn').style.display = '';
  openModal('modal-login');
}

/* เปิดหน้า Login ตรง ๆ (กดจากปุ่มกุญแจ) */
function openLoginManual() {
  pendingAction = null;
  mode = 'login';
  pinBuffer = '';
  renderPinUI('🔒 เข้าสู่ระบบแอดมิน', 'กรอกรหัส PIN เพื่อแก้ไข/ลบข้อมูล');
  document.getElementById('pin-cancel-btn').style.display = '';
  openModal('modal-login');
}

/* ปุ่มกุญแจ: ถ้า login อยู่แล้ว = ออกจากระบบ, ถ้ายัง = เปิดหน้า Login */
export function toggleAdmin() {
  if (isAdmin) {
    logoutAdmin();
  } else {
    openLoginManual();
  }
}

export function logoutAdmin() {
  isAdmin = false;
  sessionStorage.removeItem(SESSION_KEY);
  updateAdminBadge();
  showToast('ออกจากระบบแอดมินแล้ว 🔒');
}

/* เปิดหน้าตั้งรหัส PIN ใหม่ (เห็นปุ่ม ⚙️ เฉพาะตอน login อยู่) */
export function openChangePin() {
  if (!isAdmin) return;
  mode = 'setNew';
  firstNewPin = '';
  pinBuffer = '';
  renderPinUI('🔑 ตั้งรหัส PIN ใหม่', 'กรอกรหัส PIN ใหม่ 4 หลัก');
  document.getElementById('pin-cancel-btn').style.display = '';
  openModal('modal-login');
}

/* ===== PIN pad events ===== */
export function pinPress(d) {
  if (pinBuffer.length >= PIN_LENGTH) return;
  pinBuffer += d;
  renderPinDots();
  document.getElementById('pin-error').textContent = '';

  if (pinBuffer.length === PIN_LENGTH) {
    setTimeout(() => {
      if (mode === 'login')        checkLoginPin();
      else if (mode === 'setNew')  advanceToConfirmNew();
      else if (mode === 'confirmNew') checkConfirmNewPin();
    }, 120);
  }
}

export function pinBackspace() {
  pinBuffer = pinBuffer.slice(0, -1);
  renderPinDots();
  document.getElementById('pin-error').textContent = '';
}

export function cancelLogin() {
  pendingAction = null;
  pinBuffer = '';
  firstNewPin = '';
  mode = 'login';
  closeModal('modal-login');
}

/* ===== internal logic ===== */
function checkLoginPin() {
  if (pinBuffer === (state.adminPin || DEFAULT_PIN)) {
    isAdmin = true;
    sessionStorage.setItem(SESSION_KEY, '1');
    pinBuffer = '';
    closeModal('modal-login');
    showToast('เข้าสู่ระบบแอดมินแล้ว 🔓');
    updateAdminBadge();
    const action = pendingAction;
    pendingAction = null;
    if (action) action();
  } else {
    failPin('รหัส PIN ไม่ถูกต้อง');
  }
}

function advanceToConfirmNew() {
  firstNewPin = pinBuffer;
  pinBuffer = '';
  mode = 'confirmNew';
  renderPinDots();
  document.getElementById('login-mode-title').textContent = '🔑 ยืนยันรหัส PIN ใหม่';
  document.getElementById('login-mode-sub').textContent   = 'กรอกรหัส PIN ใหม่อีกครั้งเพื่อยืนยัน';
}

function checkConfirmNewPin() {
  if (pinBuffer === firstNewPin) {
    state.adminPin = pinBuffer;
    saveState();
    pinBuffer = '';
    firstNewPin = '';
    mode = 'login';
    closeModal('modal-login');
    showStatus('success', 'เปลี่ยนรหัส PIN สำเร็จ', 'ใช้รหัสใหม่ในการเข้าสู่ระบบครั้งถัดไป');
  } else {
    failPin('รหัสไม่ตรงกัน ลองใหม่อีกครั้ง');
    mode = 'setNew';
    firstNewPin = '';
    document.getElementById('login-mode-title').textContent = '🔑 ตั้งรหัส PIN ใหม่';
    document.getElementById('login-mode-sub').textContent   = 'กรอกรหัส PIN ใหม่ 4 หลัก';
  }
}

function failPin(msg) {
  document.getElementById('pin-error').textContent = msg;
  const dotsWrap = document.getElementById('pin-dots');
  dotsWrap.classList.add('shake');
  setTimeout(() => dotsWrap.classList.remove('shake'), 400);
  pinBuffer = '';
  setTimeout(renderPinDots, 150);
}

function renderPinUI(title, sub) {
  document.getElementById('login-mode-title').textContent = title;
  document.getElementById('login-mode-sub').textContent   = sub;
  document.getElementById('pin-error').textContent        = '';
  renderPinDots();
}

function renderPinDots() {
  const dots = document.querySelectorAll('#pin-dots .pin-dot');
  dots.forEach((dot, i) => dot.classList.toggle('filled', i < pinBuffer.length));
}

/* อัปเดตไอคอนกุญแจ + ปุ่มตั้งค่า PIN ทุกจุดในหน้าเว็บ */
export function updateAdminBadge() {
  document.querySelectorAll('.admin-badge').forEach(el => {
    el.classList.toggle('on', isAdmin);
    el.textContent = isAdmin ? '🔓' : '🔒';
    el.title = isAdmin ? 'แอดมิน (คลิกเพื่อออกจากระบบ)' : 'เข้าสู่ระบบแอดมิน';
  });
  document.querySelectorAll('.admin-pin-settings').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });
}
