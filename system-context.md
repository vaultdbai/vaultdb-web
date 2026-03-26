# SYSTEM RULES [DO NOT OVERRIDE]
This file contains the absolute source of truth for the `vaultdb-web` repository.
Before suggesting any code, verify it aligns with the standards below.

# System Context: VaultDB.ai Static Website

**Repository Mission**
`vaultdb-web` is the **static website** for [vaultdb.ai](https://vaultdb.ai). It contains product documentation, company information, and marketing pages for VaultDB and its financial domain ecosystem. The site must be **fully static** — it can be served from any location (local filesystem, S3, GitHub Pages, Nginx, Apache) without requiring a web server, build step, or backend process.

**Opening `index.html` directly in a browser must work.**

## Architecture: Pure Static HTML

This is **NOT** a framework-based application. There is no React, Next.js, Vite, or any build tool.

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Structure** | Plain HTML5 | Semantic markup, one `.html` file per page |
| **Styling** | Vanilla CSS | Per-page stylesheets in `css/` directory |
| **Interactivity** | Vanilla JavaScript | Per-page scripts in `js/` directory |
| **UI Framework** | Bootstrap 5.3 (CDN) | Grid system, responsive utilities |
| **Icons** | Font Awesome 6 (CDN) | Icon library |
| **Animations** | AOS (CDN) | Animate On Scroll library |
| **Images** | Static PNGs/SVGs | All in `img/` directory |

## Project Map

```
vaultdb-web/
├── index.html              — Homepage (main landing page)
├── about.html              — About Us page
├── contact.html            — Contact Us page
├── error.html              — Error / 404 page
├── formsubmit.html         — Form submission handler
├── welcome_template.html   — Welcome email template
├── css/
│   ├── style.css           — Homepage styles
│   ├── about.css           — About page styles
│   ├── contact.css         — Contact page styles
│   └── form.css            — Form styles
├── js/
│   ├── index.js            — Homepage interactions
│   ├── about..js           — About page interactions
│   └── contact.js          — Contact page interactions
└── img/
    ├── mainlogo.png        — Primary logo
    ├── v-logo.png          — Favicon / OG image
    └── ...                 — All other static assets
```

---

## CRITICAL RULES

### 1. All Paths MUST Be Relative
**NEVER** use absolute paths, root-relative paths, or protocol-relative URLs for local assets.

```html
<!-- CORRECT — relative paths -->
<link rel="stylesheet" href="css/style.css" />
<img src="img/mainlogo.png" alt="VaultDB" />
<a href="about.html">About Us</a>
<script src="js/index.js"></script>

<!-- WRONG — absolute or root-relative paths -->
<link rel="stylesheet" href="/css/style.css" />
<img src="/img/mainlogo.png" alt="VaultDB" />
<a href="/about.html">About Us</a>
```

This ensures the site works when:
- Opened directly via `file:///` protocol (double-clicking `index.html`)
- Served from a subdirectory (e.g., `https://example.com/vaultdb/`)
- Hosted on S3, GitHub Pages, or any static host

### 2. No Build Step Required
- **NO** `npm`, `node_modules`, `package.json`, `webpack`, `vite`, or any build tooling
- **NO** TypeScript, JSX, SCSS, LESS, or any transpiled language
- **NO** `npm run build`, `npm run dev`, or any compilation step
- The files in this repo ARE the final output — what you see is what gets deployed

### 3. No Server-Side Dependencies
- **NO** server-side rendering, API routes, or dynamic endpoints
- **NO** `.env` files for runtime configuration
- **NO** database connections or backend proxy
- External links (e.g., `https://docs.vaultdb.ai`) are fine — they point to separate services

### 4. CDN Dependencies Only
Third-party libraries are loaded from CDNs with integrity hashes:
- Bootstrap CSS/JS from `cdn.jsdelivr.net`
- Font Awesome from `cdnjs.cloudflare.com`
- AOS (Animate On Scroll) from `unpkg.com`

**DO NOT** add new CDN dependencies without good reason. If a library is needed, prefer CDN-hosted with `integrity` and `crossorigin` attributes.

### 5. Static Content Only
All content is hardcoded in HTML. There is no CMS, no API-fetched content, no dynamic rendering.
- Product descriptions, FAQ answers, team bios — all inline in HTML
- Images — all pre-generated and stored in `img/`
- No JavaScript-driven content loading (no `fetch()` to load page sections)

---

## Coding Standards

### HTML
- Semantic HTML5 elements (`<header>`, `<section>`, `<nav>`, `<footer>`, `<main>`)
- Proper `<meta>` tags for SEO (title, description, OG properties)
- All `<img>` tags must have `alt` attributes
- Mobile-responsive via Bootstrap grid + custom CSS media queries

### CSS
- One stylesheet per page (`style.css` for index, `about.css` for about, etc.)
- CSS custom properties (variables) for theming (e.g., `var(--main-color)`, `var(--para-color)`)
- Dark theme is the default design language
- No CSS frameworks other than Bootstrap (no Tailwind, no Bulma)

### JavaScript
- Vanilla JS only — no jQuery, no React, no framework
- Minimal JS — used only for accordion toggles, mobile menu, and scroll animations
- No ES module imports (plain `<script src="...">` tags)

### Images
- Use PNG for logos and UI elements
- Use SVG for icons and simple graphics where possible
- Compress images before committing (keep file sizes reasonable)
- All images in `img/` directory — no subdirectories

---

## Page Descriptions

| Page | File | Purpose |
|------|------|---------|
| **Homepage** | `index.html` | Landing page with hero section, product overview, financial domain ecosystem grid, FAQ accordion |
| **About** | `about.html` | Company story, team photos, mission statement |
| **Contact** | `contact.html` | Contact form, office details |
| **Error** | `error.html` | 404 / error page |

---

## Deployment

The site can be deployed by simply copying all files to any static hosting:

```bash
# GitHub Pages — just push to gh-pages branch
# S3 — sync the directory
aws s3 sync . s3://vaultdb-website/ --exclude ".git/*" --exclude "*.md"

# Local preview — just open in browser
# Windows:
start index.html
# Mac:
open index.html
# Linux:
xdg-open index.html
```

No build step. No compilation. No server process. Just files.
