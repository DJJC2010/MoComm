/**
 * listings.js — Featured Listings Carousel with API Integration
 *
 * ══════════════════════════════════════════════════════
 *  HOW TO CONNECT YOUR API
 * ══════════════════════════════════════════════════════
 *
 * 1. Set LISTINGS_API_ENDPOINT to your API base URL.
 *    Example: 'https://api.yourmls.com/v1/featured-listings'
 *
 * 2. Set FILTER_MODE:
 *    'server' — Tab clicks send ?type=industrial to the API (recommended)
 *    'client' — All listings fetched once; tabs filter client-side by card type
 *
 * 3. Implement transformListing(raw) to map your API's field names
 *    to the card schema. See the schema docs below.
 *
 * 4. If your API requires auth headers, add them to API_HEADERS.
 *
 * ══════════════════════════════════════════════════════
 *  LISTING CARD SCHEMA
 * ══════════════════════════════════════════════════════
 *
 *  {
 *    id:         string   — Unique listing ID (used for href)
 *    name:       string   — Property name / title
 *    city:       string   — City
 *    state:      string   — State abbreviation (e.g. "MO")
 *    type:       string   — 'industrial' | 'retail' | 'office' | 'multifamily' | 'land' | 'investment'
 *    price:      string   — Formatted price string (e.g. "$4,200,000")
 *    size:       string   — Size string (e.g. "42,000 SF")
 *    capRate:    string?  — Cap rate string (e.g. "6.25%") — optional
 *    imageUrl:   string?  — Image URL — optional; placeholder shown if missing
 *    isNew:      boolean? — Show "NEW" badge if true
 *    detailUrl:  string?  — Link to detail page; defaults to /listings/{id}
 *  }
 */

(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────

  /** @type {string|null} Set to your API endpoint. null = demo mode (sample data shown) */
  const LISTINGS_API_ENDPOINT = null;

  /** 'server' or 'client' filtering — see docs above */
  const FILTER_MODE = 'client';

  /** Additional headers for your API (e.g. Authorization) */
  const API_HEADERS = {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
  };

  /** Number of cards visible at once (desktop) */
  const CARDS_PER_PAGE = 4;

  // ── State ──────────────────────────────────────────────────────
  let allListings   = [];
  let activeType    = 'all';
  let currentOffset = 0;

  // ── DOM refs ───────────────────────────────────────────────────
  const track    = document.getElementById('listings-track');
  const prevBtn  = document.getElementById('carousel-prev');
  const nextBtn  = document.getElementById('carousel-next');
  const tabsEl   = document.getElementById('listings-tabs');

  if (!track) return; // Component not on page

  // ── API Fetch ──────────────────────────────────────────────────

  /**
   * Fetch listings from your API.
   * @param {string} type  — listing type filter, or 'all'
   * @returns {Promise<Array>}  — normalized listing objects
   */
  async function fetchListings(type = 'all') {
    if (!LISTINGS_API_ENDPOINT) {
      // Demo mode — return sample data
      return getDemoListings(type);
    }

    const url = new URL(LISTINGS_API_ENDPOINT);
    if (FILTER_MODE === 'server' && type !== 'all') {
      url.searchParams.set('type', type);
    }
    url.searchParams.set('featured', 'true');
    url.searchParams.set('limit', '20');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: API_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // TODO: Adjust to match your API's response envelope.
    // Common patterns:
    //   data.listings   (array directly under 'listings' key)
    //   data.results    (paginated results)
    //   data            (array at top level)
    const raw = Array.isArray(data) ? data
              : data.listings       ? data.listings
              : data.results        ? data.results
              : [];

    return raw.map(transformListing);
  }

  /**
   * Transform a raw API listing object into the card schema.
   * EDIT THIS FUNCTION to match your API's field names.
   * @param {Object} raw
   * @returns {Object}
   */
  function transformListing(raw) {
    return {
      id:        raw.id          || raw.listingId    || raw.mlsNumber,
      name:      raw.name        || raw.title        || raw.propertyName,
      city:      raw.city        || raw.marketArea   || '',
      state:     raw.state       || raw.stateCode    || 'MO',
      type:      (raw.type       || raw.propertyType || '').toLowerCase(),
      price:     raw.price       || raw.listPrice    || raw.askingPrice || '',
      size:      raw.size        || raw.squareFeet   || raw.totalSF     || '',
      capRate:   raw.capRate     || raw.capRateStr   || raw.cap_rate    || null,
      imageUrl:  raw.imageUrl    || raw.primaryImage || raw.thumbnailUrl || null,
      isNew:     raw.isNew       || raw.newListing   || false,
      detailUrl: raw.detailUrl   || raw.url          || `/listings/${raw.id}`,
    };
  }

  // ── Render ─────────────────────────────────────────────────────

  /** Build a single listing card's HTML string */
  function buildCard(listing) {
    const imgHtml = listing.imageUrl
      ? `<img class="listing-card__img" src="${esc(listing.imageUrl)}" alt="${esc(listing.name)}" loading="lazy">`
      : `<div class="listing-card__img" style="background:linear-gradient(135deg,#1e2e1e,#243424);display:flex;align-items:center;justify-content:center;height:100%;color:#4a7a1e;">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
         </div>`;

    const newBadge  = listing.isNew ? `<span class="listing-card__badge">New</span>` : '';
    const typeBadge = listing.type  ? `<span class="listing-card__type-badge">${esc(ucfirst(listing.type))}</span>` : '';
    const capRow    = listing.capRate ? `<div class="listing-card__cap-rate">Cap Rate: ${esc(listing.capRate)}</div>` : '';
    const location  = [listing.city, listing.state].filter(Boolean).join(', ');
    const href      = listing.detailUrl || `/listings/${listing.id}`;

    return `
      <article class="listing-card" onclick="window.location.href='${esc(href)}'" role="button" tabindex="0"
               onkeydown="if(event.key==='Enter'||event.key===' ')window.location.href='${esc(href)}'">
        <div class="listing-card__img-wrap">
          ${imgHtml}
          ${newBadge}
          ${typeBadge}
        </div>
        <div class="listing-card__body">
          <div class="listing-card__name">${esc(listing.name)}</div>
          <div class="listing-card__location">${esc(location)}</div>
          <div class="listing-card__meta">
            <span class="listing-card__price">${esc(listing.price)}</span>
            <span class="listing-card__size">${esc(listing.size)}</span>
            ${capRow}
          </div>
        </div>
      </article>`;
  }

  /** Render the visible slice of cards */
  function renderCards(listings) {
    currentOffset = 0;

    if (listings.length === 0) {
      track.innerHTML = `
        <div class="listings-empty">
          <svg class="listings-empty__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          <span class="listings-empty__text">No listings available</span>
        </div>`;
      updateArrows(listings);
      return;
    }

    track.innerHTML = listings.map(buildCard).join('');
    updateCarouselPosition();
    updateArrows(listings);
  }

  /** Slide the carousel track */
  function updateCarouselPosition() {
    // Get current card width dynamically
    const card = track.querySelector('.listing-card');
    if (!card) return;
    const gap = 16; // matches --space-md
    const cardW = card.offsetWidth + gap;
    track.style.transform = `translateX(-${currentOffset * cardW}px)`;
  }

  /** Show/hide prev/next arrows based on offset */
  function updateArrows(listings) {
    const total   = listings.length;
    const maxPage = Math.max(0, total - CARDS_PER_PAGE);
    if (prevBtn) prevBtn.style.opacity = currentOffset <= 0 ? '0.3' : '1';
    if (nextBtn) nextBtn.style.opacity = currentOffset >= maxPage ? '0.3' : '1';
    if (prevBtn) prevBtn.disabled = currentOffset <= 0;
    if (nextBtn) nextBtn.disabled = currentOffset >= maxPage;
  }

  // ── Tab Filtering ──────────────────────────────────────────────

  function getFilteredListings() {
    if (activeType === 'all') return allListings;
    return allListings.filter(l => l.type === activeType);
  }

  // ── Load Listings ──────────────────────────────────────────────

  async function loadListings(type = 'all') {
    // Show loading
    track.innerHTML = `<div class="listings-loading" id="listings-loading">
      <div class="listings-loading__spinner"></div>Loading Listings...</div>`;

    try {
      if (FILTER_MODE === 'server' || allListings.length === 0) {
        allListings = await fetchListings(type);
      }

      const toShow = FILTER_MODE === 'client' ? getFilteredListings() : allListings;
      renderCards(toShow);
    } catch (err) {
      console.error('[listings.js] Failed to load listings:', err);
      track.innerHTML = `
        <div class="listings-empty">
          <svg class="listings-empty__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span class="listings-empty__text">Unable to load listings</span>
        </div>`;
    }
  }

  // ── Events ─────────────────────────────────────────────────────

  // Tab clicks
  if (tabsEl) {
    tabsEl.addEventListener('click', (e) => {
      const tab = e.target.closest('.listings-tab');
      if (!tab) return;

      tabsEl.querySelectorAll('.listings-tab').forEach(t => {
        t.classList.remove('listings-tab--active');
        t.setAttribute('aria-selected', 'false');
      });

      tab.classList.add('listings-tab--active');
      tab.setAttribute('aria-selected', 'true');
      activeType = tab.dataset.type || 'all';

      loadListings(activeType);
    });
  }

  // Carousel arrows
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentOffset <= 0) return;
      currentOffset = Math.max(0, currentOffset - 1);
      updateCarouselPosition();
      updateArrows(getFilteredListings());
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const filtered = getFilteredListings();
      const max = Math.max(0, filtered.length - CARDS_PER_PAGE);
      if (currentOffset >= max) return;
      currentOffset = Math.min(max, currentOffset + 1);
      updateCarouselPosition();
      updateArrows(filtered);
    });
  }

  // Recompute on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateCarouselPosition();
      updateArrows(getFilteredListings());
    }, 150);
  });

  // ── Init ───────────────────────────────────────────────────────
  loadListings('all');

  // ── Helpers ────────────────────────────────────────────────────

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function ucfirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ── Demo Data ──────────────────────────────────────────────────
  // Shown when LISTINGS_API_ENDPOINT is null. Replace with real data.

  function getDemoListings(type) {
    const all = [
      {
        id: 'demo-1', name: '850,000 SF Industrial Facility',
        city: 'Fenton', state: 'MO', type: 'industrial',
        price: '$42,500,000', size: '850,000 SF', capRate: '6.25%',
        imageUrl: null, isNew: false,
      },
      {
        id: 'demo-2', name: 'Midwest Logistics Park',
        city: "O'Fallon", state: 'MO', type: 'industrial',
        price: '$28,750,000', size: '560,000 SF', capRate: '6.75%',
        imageUrl: null, isNew: false,
      },
      {
        id: 'demo-3', name: 'Shops at Ward Parkway',
        city: "Lee's Summit", state: 'MO', type: 'retail',
        price: '$8,900,000', size: '42,000 SF', capRate: '7.10%',
        imageUrl: null, isNew: true,
      },
      {
        id: 'demo-4', name: 'Class A Office Building',
        city: 'Columbia', state: 'MO', type: 'office',
        price: '$6,250,000', size: '68,000 SF', capRate: '6.00%',
        imageUrl: null, isNew: false,
      },
      {
        id: 'demo-5', name: 'Springfield Retail Center',
        city: 'Springfield', state: 'MO', type: 'retail',
        price: '$3,100,000', size: '18,500 SF', capRate: '7.50%',
        imageUrl: null, isNew: true,
      },
      {
        id: 'demo-6', name: 'Metro Multifamily Portfolio',
        city: 'Kansas City', state: 'MO', type: 'multifamily',
        price: '$12,400,000', size: '84 Units', capRate: '5.80%',
        imageUrl: null, isNew: false,
      },
    ];
    if (type === 'all') return all;
    return all.filter(l => l.type === type);
  }

})();
