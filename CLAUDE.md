# CLAUDE.md — VaultDB.ai Static Website

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

All instructions — architecture, coding standards, and behavioral guardrails — are maintained in **[system-context.md](system-context.md)**. Read that file before making any changes.

## Key Facts
- This is a **pure static HTML/CSS/JS website** for [vaultdb.ai](https://vaultdb.ai)
- **No build step** — no npm, no framework, no compilation
- **No server required** — opening `index.html` in a browser must work
- **All paths must be relative** — `css/style.css`, `img/logo.png`, `about.html` (never `/css/style.css`)
- **CDN-only externals** — Bootstrap, Font Awesome, AOS loaded via `<script>` / `<link>` tags
- **Dark theme** — the site uses a dark color scheme with CSS custom properties
