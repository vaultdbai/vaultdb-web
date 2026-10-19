# Nandin rebrand (W1–W7)

The VaultDB Nest product is now **Nandin** (see `docs/nandin-brand-kit/` and `docs/developer/nandin-rename.md` in the app repo). This branch rebrands the product on the site. VaultDB stays the company and keeps its logo in the header.

## Audit (W1)

| Where | Before | After |
| --- | --- | --- |
| Product name in every page, `js/agents.js`, `js/nest.js`, `system-context.md`, `downloads/nest/README.md` | "VaultDB Nest", "Nest" | "Nandin" |
| `index.html` title, description, Open Graph and Twitter tags | VaultDB Nest | Nandin; new `img/nandin-og.png` (1200×630, the bull and the wordmark) |
| Favicon and apple-touch-icon (home page) | `img/v-logo.png` | `img/nandin-mark.svg`, `img/nandin-icon-256.png` |
| Hero eyebrow icon | `img/nest-icon.svg` | `img/nandin-mark.svg` |
| Hero | "The agent manager for teams" | the bull in `wait`, and the positioning: one accountable owner per responsibility, agents that do the legwork, a record that proves it |
| URLs | — | Unchanged: `nest.html` still forwards to the home page, and `downloads/nest/…` and the installer file names are as before, so download links and the app updater keep working |

## Colours (W3)

The bull's `--nandin-*` variables are set from the site's own tokens (`--main-color`, `--white-color`, `--purple-color`, `--para-color`) in `css/nest.css`. The kit's hex values are fallbacks only, and the waiting dot keeps the kit's amber because the site has no amber token. The site keeps its purple-on-navy palette. Matching it to the app's default blue palette would restyle the VaultDB Database pages too, so that is the owner's call.

## Left for the owner

- **Screenshots**: `img/nest-run-detail.*`, `nest-workflow.*`, `nest-marketplace.*` and `nest-companion.*` still show the old name in the app's title bar. Retake them from the renamed app.
- **Other pages' favicons** still use the VaultDB mark, because they are company pages.
- **Installer file names** (`VaultDB-Nest-0.1.0-windows-x64.msi`) change with the next release; `downloads/nest/latest.json` points the buttons at them.

## Verify (W7)

Checked `index.html` at desktop width in headless Edge. The page is dark-only. At phone width, headless Edge clips at its minimum window width, the same as the page before the change, so the narrow layout needs checking in a real mobile browser.
