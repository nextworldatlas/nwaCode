# Next World Atlas (nwa_atlas)

Consolidation of four previously separate GitHub repos into one working monorepo.

| Was | Now | Contents |
|---|---|---|
| `nextworldatlas/nwaCode` | repo root | React app (CRA + mapbox-gl) |
| `nextworldatlas/data` | `public/data/` | 39 historical world GeoJSONs (`world_bc3000` → `world_2010`) |
| `nextworldatlas/markers` | `public/markers/` | 28 colored map-marker PNGs |
| `nextworldatlas/markersgrey` | `public/markersgrey/` | 24 greyed-out empire marker PNGs |

Previously the app fetched all assets from `raw.githubusercontent.com` at runtime. Those URLs
are now local paths in `src/source-geojson.json` and `src/2png-load.json`, so the app has no
external asset dependency and a marker rename can be committed atomically with its reference.

## Setup

```bash
npm install
cp .env.example .env
```

Put a Mapbox public token (`pk.…`) in `.env` as `REACT_APP_MAPBOX_KEY`. Without it, mapbox-gl
throws `An API access token is required` and the app renders blank.

```bash
npm start
```

`.env` also sets `PORT=3001` (3000 was in use) and `BROWSER=none`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and FTPs `build/`
into `public_html` on Hostinger (nextworldatlas.com). No manual upload.

Required repo secrets — Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `REACT_APP_MAPBOX_KEY` | Mapbox public token (`pk.…`). Baked into the bundle at build time. |
| `FTP_SERVER` | Hostinger FTP hostname from hPanel → Files → FTP Accounts |
| `FTP_USERNAME` | FTP account username |
| `FTP_PASSWORD` | FTP account password |

The first deploy uploads everything (~98 MB); after that the action diffs against
`.ftp-deploy-sync-state.json` in `public_html` and uploads only what changed.

## Notes

- `git remote` is named `nwaCode-upstream`, not `origin`, so nothing pushes to the old app repo
  by accident. The three asset repos are not remotes here.
- Only 9 of the 39 GeoJSONs are referenced (years 1, 200, 500, 700, 1000, 1279, 1500, 1783,
  2000, via `src/source-geojson.json`). The rest are carried along unused.
- `public/data/` is ~65 MB on disk. It ships in `npm run build` output as-is.
- Source layer names are logical, not filenames: `world_250` → `world_200.geojson`,
  `world_750` → `world_700.geojson`, `world_1250` → `world_1279.geojson`,
  `world_1750` → `world_1783.geojson`.
