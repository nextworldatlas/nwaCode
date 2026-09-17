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

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds once and rsyncs
`build/` over SSH to two docroots on Hostinger. No manual upload.

| URL | Docroot | Delete semantics |
|---|---|---|
| nextworldatlas.com | `~/public_html` | scoped — see below |
| history.nextworldatlas.com | `~/domains/history.nextworldatlas.com/public_html` | full `--delete` (docroot is ours alone) |

history is a straight mirror of production, not a staging environment. The run ends by
fetching both URLs and asserting they serve the same bundle hash.

Do **not** re-enable Hostinger's own Git integration (hPanel → Advanced → GIT) on either
site. It clones the repo source into the docroot without running a build, which leaves no
`index.html` and returns 403 — and it would fight this workflow on every push.

Host details are non-secret and live in the workflow's `env:` block —
`62.72.50.247`, port `65002`, user `u857656583`.

Required repo secrets — Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `REACT_APP_MAPBOX_KEY` | Mapbox public token (`pk.…`). Baked into the bundle at build time. |
| `SSH_PRIVATE_KEY` | Private half of the deploy keypair. Public half goes in hPanel → Advanced → SSH Access → SSH keys. |

### public_html is shared — do not add a blanket `--delete`

Three other sites sit inside `public_html` as subdirectories: `airportrouteatlas/`,
`bookings/`, and `guesspolis/`. A top-level `rsync --delete` (or an FTP action's
default sync-with-delete) would erase all three.

(A fourth, `test/`, was a stale copy of this app and the last consumer of the
`raw.githubusercontent` URLs. It was moved to `~/test.retired-2026-08-04` on
2026-08-04, outside the web root.)

The workflow therefore syncs root-level files **without** `--delete`, and scopes `--delete`
to the four directories this app owns: `static/`, `data/`, `markers/`, `markersgrey/`.
A post-deploy step asserts the sibling directories still exist and fails the run if not.
If another site is ever added under `public_html`, it is safe by default — but never
"simplify" this into one recursive delete.

## Notes

- `git remote` is named `nwaCode-upstream`, not `origin`, so nothing pushes to the old app repo
  by accident. The three asset repos are not remotes here.
- Only 9 of the 39 GeoJSONs are referenced (years 1, 200, 500, 700, 1000, 1279, 1500, 1783,
  2000, via `src/source-geojson.json`). The rest are carried along unused.
- `public/data/` is ~65 MB on disk. It ships in `npm run build` output as-is.
- Source layer names are logical, not filenames: `world_250` → `world_200.geojson`,
  `world_750` → `world_700.geojson`, `world_1250` → `world_1279.geojson`,
  `world_1750` → `world_1783.geojson`.
