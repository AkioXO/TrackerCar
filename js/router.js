/* ============================================================
   router.js — Page Navigation
   ============================================================ */

import { updateDash } from './dashboard.js';
import { renderChart } from './chart.js';
import { renderAnalytics } from './analytics.js';

let prevPage = 'page-cars';

export function goTo(pageId) {
  const current = document.querySelector('.page.active');
  prevPage = current ? current.id : 'page-cars';

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);

  if (pageId === 'page-home') {
    updateDash();
    renderChart();
  }
  if (pageId === 'page-analytics') {
    renderAnalytics();
  }
}

export function goBack() {
  goTo(prevPage);
}
