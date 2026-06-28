/* ============================================================
   state.js — App State & LocalStorage
   ============================================================ */

const STORAGE_KEY = 'mycar_tracker_v3';

export const COLOR_MAP = {
  warning: { bg: '#faeeda', color: '#854f0b', emoji: '⚪' },
  accent:  { bg: '#e6f1fb', color: '#185fa5', emoji: '🔵' },
  success: { bg: '#e1f5ee', color: '#0f6e56', emoji: '🟢' },
  pro:     { bg: '#eeedfe', color: '#3c3489', emoji: '🟣' },
  danger:  { bg: '#fcebeb', color: '#a32d2d', emoji: '🔴' },
};

export let state = {
  cars: [
    { id: 1, name: 'Toyota Yaris Ativ', plate: 'กข 1234', color: 'warning' },
    { id: 2, name: 'Honda PCX 160',     plate: '1กก 5678', color: 'accent'  },
  ],
  nextId: 3,
  data: {},
  selectedCarId: null,
  adminPin: '1234', // default Admin PIN — เปลี่ยนได้หลัง Login ผ่านปุ่ม ⚙️
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.cars) Object.assign(state, parsed);
    }
  } catch (e) { console.warn('Load state failed', e); }
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { console.warn('Save state failed', e); }
}

export function getCarData(id) {
  if (!state.data[id]) state.data[id] = { fuel: [], mod: [], maint: [] };
  return state.data[id];
}
