# CPL Meeting OS (Starter)

A future-proof foundation for your guided meeting workflow + estimator:
- Vite + Vue 3 + TypeScript
- Pinia stores
- Zod schema validation for the pricebook JSON
- Web Worker compute engine (keeps UI fast)
- PWA enabled (installable fullscreen)

## Run locally
```bash
npm install
npm run dev
```

## Replace the default pricebook
Edit:
`public/data/pricebook.default.json`

## Deploy to GitHub Pages
1) Push to `main`
2) Enable Pages → Source: GitHub Actions
3) The workflow builds with the correct `base` using `GITHUB_REPO_NAME`

## What to test right now
- /workflow: pick mode, add vision tags, pick jurisdiction
- /estimate: toggle items, set qty, open Customize sheets
- /admin: toggle pool base + change base price

## Next iterations (we’ll do these next)
- Robust rule graph (sources, dependencies, derived quantities)
- “Requirements tray”: accept required/recommended items with one tap
- Packages (Start Here) + Favorites + Search overlay
- Timeline templates + SVG Gantt print view
- Warranties/value bullets + proposal compiler


## Notes
- Uses Vite alias `@` => `src/` (configured in `vite.config.ts`).
