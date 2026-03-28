# Antigravity Instructions for VaultDB.ai Static Website

**CRITICAL**: The primary source of truth for this repository is located in [system-context.md](system-context.md).

When writing code, refactoring, or performing maintenance tasks, you MUST adhere to the standards defined in that file.

## Key Facts
- This is a **pure static HTML/CSS/JS website** for [vaultdb.ai](https://vaultdb.ai)
- **No build step** — no npm, no framework, no compilation
- **No server required** — opening `index.html` in a browser must work
- **All paths must be relative** — `css/style.css`, `img/logo.png`, `about.html` (never `/css/style.css`)
- **CDN-only externals** — Bootstrap, Font Awesome, AOS loaded via `<script>` / `<link>` tags
- **Dark theme** — the site uses a dark color scheme with CSS custom properties

## Quick References
- **Structure**: Plain HTML5 files in the repo root
- **Styles**: Per-page CSS in `css/` directory
- **Scripts**: Per-page vanilla JS in `js/` directory
- **Images**: All static assets in `img/` directory
- **Cleanup**: Remove scratch files immediately

Refer to [system-context.md](system-context.md) for full details.
