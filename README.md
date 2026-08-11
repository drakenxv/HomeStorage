# Inventory PWA

Offline-first Android inventory web app built with TypeScript, Vite, IndexedDB and PWA.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

1. Create a GitHub repository.
2. Push this project.
3. Enable GitHub Actions / Pages.
4. Add a workflow that runs `npm ci`, `npm run build`, then deploys `dist/` to GitHub Pages.

The Vite config uses `base: "./"` so the generated application can be served from a GitHub Pages project path.

## Current release

Implemented:
- Dashboard / expiring stock report
- Add / remove workflow
- Camera barcode scanning using browser BarcodeDetector where supported
- Manual search
- New item creation
- Storage locations CRUD
- Inventory by storage location
- Expiry report
- Under-minimum report with shopping-list creation
- Shopping list and bought state
- CSV import/export
- PWA configuration
- IndexedDB local persistence

Future:
- Recipe management and recipe suggestions
- Wishlist
- More advanced CSV validation/import preview
- Item editing/deletion UI
- Richer barcode compatibility fallback
- Automated shopping-list quantities and reporting filters
