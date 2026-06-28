/* ============================================================
   main.js — App Entry Point
   ============================================================ */

import { state, loadState }               from './state.js';
import { renderCars, saveNewCar, saveEditCar, askDel, askEdit, selectCar, previewPhoto } from './cars.js';
import { goTo, goBack }                   from './router.js';
import {
  calcFuel, saveFuel, saveMod, saveMaint, swTab,
  askEditHist, saveEditHist, askDelHist, calcEditFuel,
}                                          from './forms.js';
import { openModal, closeModal, showStatus, runConfirm } from './utils.js';
import { renderAnalytics }                from './analytics.js';
import {
  requireAdmin, pinPress, pinBackspace, cancelLogin,
  toggleAdmin, openChangePin, updateAdminBadge,
}                                          from './auth.js';

// ─── Expose functions called from HTML attributes ──────────────────────────
window.goTo            = goTo;
window.goBack          = goBack;
window.openModal       = openModal;
window.closeModal      = closeModal;
window.saveNewCar      = saveNewCar;
window.saveEditCar     = saveEditCar;
window.selectCar       = selectCar;
window.calcFuel        = calcFuel;
window.saveFuel        = saveFuel;
window.saveMod         = saveMod;
window.saveMaint       = saveMaint;
window.swTab           = swTab;
window.renderAnalytics = renderAnalytics;
window._previewPhoto   = previewPhoto;

// Generic confirm modal (delete car / delete history item)
window._runConfirm     = runConfirm;

// ── Admin-gated actions: ต้อง Login (PIN) ก่อนเสมอ ──
window._askDel         = (id, name) => requireAdmin(() => askDel(id, name));
window._askEdit        = (id)       => requireAdmin(() => askEdit(id));
window._editHist       = (type, i)  => requireAdmin(() => askEditHist(type, i));
window._delHist        = (type, i)  => requireAdmin(() => askDelHist(type, i));
window._saveEditHist    = saveEditHist;
window._calcEditFuel    = calcEditFuel;

// Admin login / PIN pad
window._pinPress        = pinPress;
window._pinBackspace    = pinBackspace;
window._cancelLogin     = cancelLogin;
window._toggleAdmin     = toggleAdmin;
window._openChangePin   = openChangePin;

// ─── Init ──────────────────────────────────────────────────────────────────
loadState();
renderCars();
updateAdminBadge();

// Default dates to today
const today = new Date();
document.getElementById('f-date').valueAsDate  = today;
document.getElementById('m-date').valueAsDate  = today;
document.getElementById('mn-date').valueAsDate = today;

// Restore car label if a car was previously selected
if (state.selectedCarId) {
  const car = state.cars.find(c => c.id === state.selectedCarId);
  if (car) {
    document.getElementById('dash-title').textContent  = car.name;
    document.getElementById('dash-sub').textContent    = car.plate || '';
    document.getElementById('fuel-sub').textContent    = car.name;
    document.getElementById('mod-sub').textContent     = car.name;
    document.getElementById('maint-sub').textContent   = car.name;
  }
}

// Close any modal when clicking outside it
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target !== overlay) return;
    if (overlay.id === 'modal-login') {
      cancelLogin();
    } else {
      overlay.classList.remove('open');
    }
  });
});
