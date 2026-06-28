/* ============================================================
   utils.js — Helpers & Utilities
   ============================================================ */

/* Format number as Thai Baht */
export function fmt(n) {
  return '฿' + Math.round(parseFloat(n) || 0).toLocaleString('th-TH');
}

/* Escape HTML to prevent XSS */
export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

/* Escape for use inside single-quoted JS attribute strings */
export function escAttr(str) {
  return String(str).replace(/'/g, "\\'");
}

/* Toast notification */
export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* Modal helpers */
export function openModal(id)  { document.getElementById(id).classList.add('open'); }
export function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* Status Pop-up: type = 'success' | 'error' | 'warning' */
export function showStatus(type, title, msg) {
  const iconEl  = document.getElementById('status-icon');
  const titleEl = document.getElementById('status-title');
  const msgEl   = document.getElementById('status-msg');
  const box     = document.querySelector('.modal-status-box');

  const map = {
    success: { icon: '✓', cls: 'status-success' },
    error:   { icon: '✕', cls: 'status-error'   },
    warning: { icon: '!', cls: 'status-warning'  },
  };
  const cfg = map[type] || map.success;

  iconEl.textContent  = cfg.icon;
  titleEl.textContent = title;
  msgEl.textContent   = msg;

  box.classList.remove('status-success', 'status-error', 'status-warning');
  box.classList.add(cfg.cls);

  openModal('modal-status');
}

/* Detail Pop-up */
export function showDetail(icon, title, sub, bodyHtml) {
  document.getElementById('detail-icon').textContent  = icon;
  document.getElementById('detail-title').textContent = title;
  document.getElementById('detail-sub').textContent   = sub;
  document.getElementById('detail-body').innerHTML    = bodyHtml;
  openModal('modal-detail');
}

/* Generic Confirm Pop-up (delete car / delete history item / etc.)
   onConfirm is called once the user presses the action button. */
let _confirmCallback = null;
export function openConfirm(title, text, onConfirm, btnLabel = 'ลบ') {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-txt').textContent   = text;
  document.getElementById('confirm-btn').textContent   = btnLabel;
  _confirmCallback = onConfirm;
  openModal('modal-confirm');
}
export function runConfirm() {
  const cb = _confirmCallback;
  _confirmCallback = null;
  closeModal('modal-confirm');
  if (cb) cb();
}
