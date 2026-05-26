# MOComm — Missouri Commercial MLS Website

## Project Structure

```
mocomm/
├── index.html              ← Main home page (all components assembled here)
│
├── css/
│   ├── variables.css       ← Design tokens, base reset, utility classes
│   ├── nav.css             ← Top bar + sticky navigation styles
│   ├── hero.css            ← Hero section + search bar styles
│   ├── sections.css        ← Feature strip, stats bar, market map styles
│   └── listings.css        ← Featured listings carousel + listing card + footer styles
│
├── js/
│   ├── nav.js              ← Mobile hamburger, sticky nav, active link detection
│   ├── search.js           ← Search bar tab switching, form submit handlers
│   └── listings.js         ← ★ Featured listings — API integration lives here
│
└── components/             ← Standalone HTML snippets (for templating systems)
    ├── nav.html
    ├── hero.html
    ├── stats-market.html
    ├── listings.html
    └── footer.html
```

---

## Connecting the Featured Listings to Your API

All listing configuration is in **`js/listings.js`**. There are three things to set:

### 1. Set your API endpoint

```js
// Line ~16 in listings.js
const LISTINGS_API_ENDPOINT = 'https://api.yourmls.com/v1/featured-listings';
```

Setting this to `null` shows demo/sample data — useful during development.

### 2. Set filter mode

```js
const FILTER_MODE = 'client';  // or 'server'
```

- `'server'` — Each tab click calls the API with `?type=industrial` appended
- `'client'` — All listings fetched once on load; tabs filter them in the browser

### 3. Map your API fields

Edit the `transformListing()` function to match your API's response shape:

```js
function transformListing(raw) {
  return {
    id:        raw.mlsNumber,          // ← your field name here
    name:      raw.propertyName,
    city:      raw.city,
    state:     raw.stateCode,
    type:      raw.propertyType.toLowerCase(),  // 'industrial', 'retail', etc.
    price:     raw.listPrice,
    size:      raw.squareFeet + ' SF',
    capRate:   raw.capRate,            // optional
    imageUrl:  raw.primaryImageUrl,    // optional
    isNew:     raw.isNewListing,       // optional boolean
    detailUrl: '/listings/' + raw.mlsNumber,
  };
}
```

### API auth headers

```js
const API_HEADERS = {
  'Authorization': 'Bearer YOUR_TOKEN',
  'X-API-Key':     'YOUR_KEY',
};
```

---

## Customizing Content

### Colors & Brand
Edit `css/variables.css` — all colors, fonts, and spacing are CSS custom properties.

| Variable | Default | Purpose |
|---|---|---|
| `--color-accent` | `#7ab648` | MOComm green — buttons, highlights |
| `--color-secondary` | `#0d1a0d` | Page background |
| `--color-surface` | `#1e2e1e` | Cards and panels |

### Hero Background Photo
In `index.html`, find the hero section and replace the inline gradient:

```html
<!-- Replace this: -->
<div class="hero__bg" style="background-image: linear-gradient(...);">

<!-- With this: -->
<div class="hero__bg" style="background-image: url('assets/hero-aerial.jpg');">
```

### Navigation Items
Edit the `<ul class="nav__menu">` block in `index.html`. Each `<li>` is a top-level item. Add `.nav__dropdown` `<ul>` inside any item for a dropdown.

### Stats Numbers
Static by default — update the `data-key` span values in the stats bar section. To make them dynamic, call `updateStats()` from your own JS:

```js
// Example: fetch stats from your API and update the DOM
fetch('/api/stats').then(r => r.json()).then(data => {
  document.querySelector('[data-key="activeListings"]').textContent = data.activeListings.toLocaleString();
  document.querySelector('[data-key="members"]').textContent        = data.members.toLocaleString();
  // etc.
});
```

### Market Trends
Edit the `.trend-row` elements in `index.html`. Change the value, and swap `.trend-row__arrow--down` ↔ `.trend-row__arrow--up` for the direction indicator.

---

## Deployment

This is plain HTML/CSS/JS — no build step required.

- **Static hosting**: Drop the folder on any web server (Apache, Nginx, Netlify, Vercel, GitHub Pages, etc.)
- **CDN**: Works out of the box on CloudFront, Cloudflare Pages, etc.
- **Templating**: The `components/` folder contains standalone HTML snippets. Include them with your framework of choice (Nunjucks, Handlebars, PHP `include`, SSI, etc.) rather than inlining into `index.html`.

### Font loading
The site uses Google Fonts (Barlow Condensed + Barlow). If you need to self-host fonts, download them from [fonts.google.com](https://fonts.google.com/specimen/Barlow+Condensed) and update the `@import` in `index.html`.

---

## Browser Support

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Chrome Android 90+
- IE11: **not supported**
