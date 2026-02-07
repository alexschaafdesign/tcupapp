# Frontend Dependency Audit

## Deprecated / Archived

| Package | Status | Replacement |
|---------|--------|-------------|
| `draft-js` | **Archived** by Meta (Feb 2023) | Lexical, TipTap (already installed via `@tiptap/*`) |
| `draft-js-export-html` | Abandoned (depends on draft-js) | Remove with draft-js |
| `draft-js-linkify-plugin` | Abandoned (depends on draft-js) | Remove with draft-js |
| `draft-js-plugins-editor` | **Explicitly deprecated** on npm | Remove with draft-js |
| `react-scripts` | **Officially deprecated** (Feb 2025) | Vite (already have `vite.config.js`) |
| `auth0-lock` | Legacy, discouraged by Auth0 | `@auth0/auth0-react` + Universal Login (already installed) |
| `prop-types` | Ignored in React 19+, maintenance-only | TypeScript |
| `tweetnacl-util` | Deprecated by maintainer | `@stablelib/utf8` + `@stablelib/base64` |

## Accidental / Bogus

| Package | Issue | Action |
|---------|-------|--------|
| `"-"` | Bogus package from a CLI typo (`npm i - foo`) | **Remove immediately** |
| `save` | Almost certainly from `npm install save` instead of `npm install --save` | **Remove** unless intentionally used |

## Severely Outdated

| Package | Installed | Current | Gap |
|---------|-----------|---------|-----|
| `googleapis` | `^39.2.0` | ~v171 | **132 major versions** behind |
| `web-vitals` | `^2.1.4` | v5.x | 3 major versions behind |

## Server-side packages that don't belong in a frontend app

These are Node.js server packages that bloat the bundle and shouldn't be frontend dependencies:

- `express` / `compression` / `express-openid-connect` — Express server + middleware
- `pg` — PostgreSQL client
- `cloudinary` — Node.js SDK (already have `@cloudinary/url-gen` for frontend)
- `auth0` — Node.js SDK (already have `@auth0/auth0-react`)

## Node polyfills (likely CRA leftovers)

Browser polyfills for Node.js builtins, typically needed by CRA. Once the Vite migration is complete, most can be removed:

- `assert`
- `buffer`
- `https-browserify`
- `process`
- `stream-browserify`
- `stream-http`
- `url`

## Recommended priorities

1. Remove accidental packages (`-`, `save`)
2. Finish CRA-to-Vite migration (remove `react-scripts`)
3. Drop the draft-js ecosystem (TipTap is already installed as a replacement)
4. Remove server-side packages (`express`, `pg`, `cloudinary`, `auth0`, etc.)
5. Upgrade severely outdated packages (`googleapis`, `web-vitals`)
6. Clean up Node polyfills after Vite migration
