/**
 * search.js — Search bar tab switching + form handlers
 *
 * Tab system switches between:
 *  - #panel-property  (Find a Property)
 *  - #panel-member    (Find a Member)
 *  - #panel-company   (Find a Company)
 */

(function () {
  'use strict';

  // ── Tab Switching ──────────────────────────────────────────────
  const tabs   = document.querySelectorAll('.search-bar__tab');
  const panels = document.querySelectorAll('.search-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = 'panel-' + tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove('search-bar__tab--active');
        t.setAttribute('aria-selected', 'false');
      });

      panels.forEach(p => {
        p.classList.remove('search-panel--active');
      });

      tab.classList.add('search-bar__tab--active');
      tab.setAttribute('aria-selected', 'true');

      const target = document.getElementById(targetId);
      if (target) target.classList.add('search-panel--active');
    });
  });

  // ── Search Handlers ────────────────────────────────────────────
  // Replace these functions with your actual routing / API calls.

  window.handlePropertySearch = function () {
    const type     = document.getElementById('prop-type')?.value || '';
    const location = document.getElementById('prop-location')?.value || '';
    const capRate  = document.getElementById('prop-cap-rate')?.value || '';
    const sfMin    = document.getElementById('prop-sf-min')?.value || '';

    const params = new URLSearchParams();
    if (type)     params.set('type', type);
    if (location) params.set('location', location);
    if (capRate)  params.set('minCapRate', capRate);
    if (sfMin)    params.set('minSF', sfMin);

    // Navigate to search results page
    // TODO: Replace with your listings search URL
    window.location.href = '/listings/search?' + params.toString();
  };

  window.handleMemberSearch = function () {
    const name     = document.getElementById('member-name')?.value || '';
    const location = document.getElementById('member-location')?.value || '';

    const params = new URLSearchParams();
    if (name)     params.set('name', name);
    if (location) params.set('location', location);

    window.location.href = '/members/directory?' + params.toString();
  };

  window.handleCompanySearch = function () {
    const name     = document.getElementById('company-name')?.value || '';
    const location = document.getElementById('company-location')?.value || '';

    const params = new URLSearchParams();
    if (name)     params.set('name', name);
    if (location) params.set('location', location);

    window.location.href = '/members/companies?' + params.toString();
  };

  // Allow Enter key to submit in search inputs
  document.querySelectorAll('.search-bar__input-wrap input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const activePanel = document.querySelector('.search-panel--active');
      if (!activePanel) return;
      const btn = activePanel.querySelector('.search-bar__submit');
      if (btn) btn.click();
    });
  });

})();
