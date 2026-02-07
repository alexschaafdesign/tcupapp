# Frontend Dependency Audit

## Questions
- Why encryption? (`tweetnacl` used in 1 file: `EncryptionService.js`)
- Why 3D rendering? (`@react-three/*` has 0 imports — never shipped?)

## Deprecated / Archived

| Package | Status | Replacement |
|---------|--------|-------------|
| `draft-js` | **Archived** by Meta (Feb 2023) | TipTap (already installed via `@tiptap/*`) |
| `draft-js-export-html` | Abandoned (depends on draft-js) | Remove with draft-js |
| `draft-js-linkify-plugin` | Abandoned (depends on draft-js) | Remove with draft-js |
| `draft-js-plugins-editor` | **Explicitly deprecated** on npm | Remove with draft-js |
| `react-scripts` | **Officially deprecated** (Feb 2025) | Vite (already have `vite.config.js`) |
| `auth0-lock` | Legacy, discouraged by Auth0 | `@auth0/auth0-react` + Universal Login (already installed) |
| `prop-types` | Ignored in React 19+, maintenance-only | TypeScript |
| `tweetnacl-util` | Deprecated by maintainer | `@stablelib/utf8` + `@stablelib/base64` |

## Completely Unused (0 imports in `src/`)

| Package | What it is |
|---------|-----------|
| `@react-spring/web`   | Animation library |
| `react-awesome-reveal` | Animation library |
| `gsap` ✅| Animation library |
| `@react-three/fiber` ✅ | 3D rendering |
| `@react-three/drei` ✅| 3D rendering helpers |
| `react-dropzone` | File upload (filepond is used instead) |
| `react-easy-crop` | Image cropping |
| `react-paginate` | Pagination |
| `http-proxy-middleware` | CRA proxy config |
| `auth0-lock` | Legacy Auth0 widget |

## Duplicate Libraries (pick one)

| Category | Packages | Recommendation |
|----------|----------|----------------|
| Date | `date-fns` (12 files) + `dayjs` (4 files) | Consolidate on **date-fns** |
| Rich text | `draft-js` ecosystem (12 files) + `@tiptap/*` (1 file) | Migrate to **TipTap** |
| Animation | `framer-motion` (2 files) + 3 unused libraries | Keep **framer-motion** only |
| Icons | `@mui/icons-material` (77+ files) + `react-icons` (1 file) | Consolidate on **MUI icons** |
| File upload | `filepond`/`react-filepond` (1 file) + `react-dropzone` (0 files) | Keep **filepond** only |

## Minimal Usage (worth questioning)

| Package | Usage |
|---------|-------|
| `googleapis@39` | 1 file (`scrapesheet.js`) — also 132 major versions behind; likely belongs in backend |
| `tweetnacl` + `tweetnacl-util` | 1 file (`EncryptionService.js`) |
| `ics` | 1 file (calendar export in `BandForm.js`) |
| `react-icons` | 1 file (`BandSocialLinks.js`) — just for FontAwesome social icons |
| `marked` | 1 file (`Advance.js`) |
| `react-datepicker` | MUI X Date Pickers is also installed and may cover the same need |

## Severely Outdated

| Package | Installed | Current | Gap |
|---------|-----------|---------|-----|
| `googleapis` | `^39.2.0` | ~v171 | **132 major versions** behind |
| `web-vitals` | `^2.1.4` | v5.x | 3 major versions behind |

## Node Polyfills (CRA leftovers)

Browser polyfills for Node.js builtins, needed by CRA's webpack config. Once the Vite migration is complete, most can be removed:

- `assert`
- `buffer`
- `https-browserify`
- `process`
- `stream-browserify`
- `stream-http`
- `url`

## Build System

The app is in a **hybrid state** — `npm start` still uses `react-scripts` despite `vite.config.js` existing. Related CRA artifacts to clean up after migration:

- `config-overrides.js` / `config-overrides.cjs` (webpack overrides)
- `workbox-webpack-plugin` (devDependency)
- `@babel/plugin-proposal-private-property-in-object` (devDependency)
- `cross-env` (devDependency, not needed with Vite)
- `browserslist` config in `package.json`

## Recommended Priorities

1. ✅ Remove accidental packages (`-`, `save`)
2. Remove completely unused packages (10 packages with 0 imports)
3. Finish CRA-to-Vite migration (remove `react-scripts` + CRA artifacts)
4. ✅ Remove server-side packages (`express`, `pg`, `cloudinary`, `auth0`, etc.)
5. Migrate draft-js to TipTap (12 files to update)
6. Consolidate duplicate libraries (date-fns over dayjs, MUI icons over react-icons)
7. Upgrade severely outdated packages (`googleapis`, `web-vitals`)
8. Clean up Node polyfills after Vite migration
