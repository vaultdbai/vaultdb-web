# VaultDB Nest downloads

Installers for VaultDB Nest, served from `https://www.vaultdb.ai/downloads/nest/`.

> Use the `www` host in URLs: `https://vaultdb.ai` (no `www`) doesn't serve HTTPS; plain `http://vaultdb.ai` only redirects to `https://www.vaultdb.ai`.
The deploy workflow (`.github/workflows/deploy.yml`) uploads this folder to the
site bucket. Only Windows builds exist for now.

## Layout

```
downloads/nest/
├── latest.json                                   — the current release (Tauri v2 updater format)
├── 0.1.0/
│   └── VaultDB-Nest-0.1.0-windows-x64.msi
├── 0.2.0/
│   └── VaultDB-Nest-0.2.0-windows-x64.msi
└── ...
```

- Every version keeps its own folder, `<version>/VaultDB-Nest-<version>-windows-x64.msi`.
  Old versions stay downloadable: the deploy never deletes anything under `downloads/`.
- `latest.json` is what both readers use:
  - the app's updater, at `https://www.vaultdb.ai/downloads/nest/latest.json`
    (`plugins.updater.endpoints` in nest-app's `src-tauri/tauri.conf.json`). When it
    sees a newer `version`, VaultDB Nest shows an Update button in the title bar.
  - the website's download buttons (`js/nest.js`), which show the version and link to
    `platforms["windows-x86_64"].url`.

```json
{
  "version": "0.1.0",
  "notes": "First release of VaultDB Nest for Windows.",
  "pub_date": "2026-10-09T00:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "<contents of the .msi.sig file>",
      "url": "https://www.vaultdb.ai/downloads/nest/0.1.0/VaultDB-Nest-0.1.0-windows-x64.msi"
    }
  }
}
```

`signature` is the updater signature of the exact `.msi` at `url` (the text of the
`.sig` file the Tauri build writes next to it). The app refuses an update whose
signature doesn't match its public key, so never edit the `.msi` after signing.

## Releasing a new version

1. In nest-app, bump the version and build the signed Windows installer
   (`TAURI_SIGNING_PRIVATE_KEY` set, `createUpdaterArtifacts` on). The build writes
   the `.msi` and its `.msi.sig`.
2. Copy the `.msi` here as `downloads/nest/<version>/VaultDB-Nest-<version>-windows-x64.msi`.
3. Update `latest.json`: `version`, `notes`, `pub_date` (RFC 3339, UTC),
   `platforms["windows-x86_64"].url` (the new path, as an absolute
   `https://vaultdb.ai/...` URL), and `signature` (the `.sig` contents).
   Also update the fallback version and link in `index.html` (the two
   `js-nest-download` buttons), which are used when `latest.json` can't be read.
4. Commit and push to `main`. The deploy uploads the new folder (`.msi` files as
   `application/x-msi`, downloaded as attachments), then `latest.json` with
   `Cache-Control: no-cache` so update checks and the website see it right away.

macOS and Linux show as "Coming soon" on the website. When they ship, add their
files to the version folder and their keys (`darwin-aarch64`, `linux-x86_64`, ...)
to `platforms`, then turn on their download buttons in `index.html`.
