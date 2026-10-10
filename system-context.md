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
├── index.html              — Home page: VaultDB Nest, the agent manager for teams
├── database.html           — VaultDB Database (in-process database + VaultDB HUB for IoT and modeling; the former homepage) and its docs links
├── products.html           — All products (VaultDB Nest, VaultDB Database) and the Agent Hub
├── agents.html             — Agent Hub: every registry agent and pack for VaultDB Nest, plus the publish guide
├── marketplace.html        — Redirect to agents.html (old URL; keeps #agent/<id> and #pack/<id>)
├── nest.html               — Redirect to index.html (old VaultDB Nest URL)
├── about.html              — About Us page
├── contact.html            — Contact Us page
├── error.html              — Error / 404 page
├── formsubmit.html         — Form submission handler
├── welcome_template.html   — Welcome email template
├── css/
│   ├── style.css           — Shared base: header, footer, FAQ, cards (index, database, products, agents, error)
│   ├── nest.css            — VaultDB Nest home page + accessible header (also loaded by products and agents)
│   ├── products.css        — Products page
│   ├── agents.css          — Agent Hub page
│   ├── about.css           — About page styles
│   ├── contact.css         — Contact page styles
│   └── form.css            — Form styles
├── js/
│   ├── index.js            — Accordion + mobile menu (database, error)
│   ├── nest.js             — Accordion + mobile menu with keyboard support, download buttons read downloads/nest/latest.json (index, products, agents)
│   ├── catalog-data.js     — GENERATED registry snapshot (window.NEST_CATALOG); do not edit by hand
│   ├── agents.js           — Renders the Agent Hub from catalog-data.js
│   ├── about..js           — About page interactions
│   └── contact.js          — Contact page interactions
├── scripts/
│   └── build-catalog.mjs   — Refreshes js/catalog-data.js from the VaultDB Nest registry (not deployed)
├── downloads/
│   └── nest/               — VaultDB Nest installers, uploaded to s3://<bucket>/downloads/ (see downloads/nest/README.md)
│       ├── latest.json     — Current release, Tauri v2 updater format; read by the app updater and the site's download buttons
│       └── <version>/      — VaultDB-Nest-<version>-windows-x64.msi, one folder per version, never deleted
└── img/
    ├── mainlogo.png        — Primary logo
    ├── v-logo.png          — Favicon
    ├── nest-*.webp/.jpg    — VaultDB Nest design-preview screenshots (webp + jpg fallback), nest-og.jpg (1200x630)
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
- Exception: `scripts/build-catalog.mjs` is an optional, dependency-free Node script that refreshes the committed data file `js/catalog-data.js`. The site works without running it; it is not a build step and `scripts/` is not deployed.
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
- Exception: the Agent Hub list is rendered by `js/agents.js` from the local `js/catalog-data.js` (a `<script>`, not a fetch), so it works from `file://`. A `<noscript>` note links to the registry.

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
| **Home (VaultDB Nest)** | `index.html` | Agent manager for teams: hero with design preview, positioning, agent managers, who it's for, how it works, screenshots, features, privacy, Teams, download (Windows from `downloads/nest/latest.json`, macOS/Linux "Coming soon"), FAQ |
| **VaultDB Database** | `database.html` | In-process database for IoT and model training, VaultDB HUB, documentation links (docs.vaultdb.ai), FAQ |
| **Products** | `products.html` | Cards for the real products only (VaultDB Nest, VaultDB Database) plus the Agent Hub |
| **Agent Hub** | `agents.html` | Searchable, filterable catalog of registry agents and packs with a detail dialog (`#agent/<id>`, `#pack/<id>`), and the publish guide |
| **Agent Hub (old URL)** | `marketplace.html` | Redirects to `agents.html` (keeps `#agent/<id>` / `#pack/<id>`) |
| **VaultDB Nest (old URL)** | `nest.html` | Redirects to `index.html` (keeps `#anchors`) |
| **About** | `about.html` | Company story, team photos, mission statement |
| **Contact** | `contact.html` | Contact form, office details |
| **Error** | `error.html` | 404 / error page |

Navigation on every page: **Products** dropdown (VaultDB Nest, VaultDB Database with its docs links, All products), **Agent Hub**, **About Us**, **Contact Us**; the same in the mobile sidebar and footer. Only list products that exist.

### Agent Hub data

Naming: the website page is the **Agent Hub**; inside the VaultDB Nest app the same catalog is the **Marketplace** tab ("browse the Agent Hub here, install from the Marketplace in VaultDB Nest").

`agents.html` renders from `js/catalog-data.js`, a committed snapshot of the VaultDB Nest registry (`github.com/devmchechi/nest-registry`). The page itself loads no remote data. To refresh the snapshot run `node scripts/build-catalog.mjs` (Node 22+, no dependencies; `--from <dir>` reads a registry copy on disk). The deploy workflow also runs it before each deploy; if the fetch fails the committed snapshot is deployed.

------|------|---------|
| **Homepage** | `index.html` | Landing page with hero section, product overview, financial domain ecosystem grid, FAQ accordion |
| **About** | `about.html` | Company story, team photos, mission statement |
| **Contact** | `contact.html` | Contact form, office details |
| **VaultDB Nest** | `nest.html` | Product page for VaultDB Nest (local-first desktop app for AI agents): features, Teams, download, FAQ. Linked from the Platform/Solutions menu and the footer |
| **Error** | `error.html` | 404 / error page |

---

## Deployment

The site can be deployed by simply copying all files to any static hosting:

```bash
# GitHub Pages — just push to gh-pages branch
# S3 — sync the directory
# What deploy.yml does:
aws s3 sync dist s3://<bucket> --delete --exclude "downloads/*"      # the site
aws s3 sync downloads s3://<bucket>/downloads ...                     # installers, NO --delete
aws s3 cp downloads/nest/latest.json ... --cache-control "no-cache, max-age=0"
# downloads/ in the bucket keeps every released installer: never delete it

# Local preview — just open in browser
# Windows:
start index.html
# Mac:
open index.html
# Linux:
xdg-open index.html
```

No build step. No compilation. No server process. Just files.

### VaultDB Nest downloads

Installers live in this repo under `downloads/nest/<version>/` and are uploaded by the deploy
workflow without `--delete`, so old versions stay downloadable. `downloads/nest/latest.json`
(Tauri v2 updater format) is the single source of truth for the current release: the app's
updater reads `https://vaultdb.ai/downloads/nest/latest.json`, and `js/nest.js` reads it to label
and link the Windows download buttons (falling back to the version hard-coded in `index.html`,
e.g. when opened from `file://`). Release steps are in `downloads/nest/README.md`. When you
release, also update the fallback version and link in `index.html`.
