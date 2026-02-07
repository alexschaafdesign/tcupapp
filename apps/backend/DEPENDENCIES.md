# Backend Dependency Audit

## Priorities
- Upgrade packages with security vulnerabilities

## Duplicate Libraries

| Category | Packages | Recommendation |
|----------|----------|----------------|
| Auth middleware | `express-jwt` (unused) + `express-oauth2-jwt-bearer` (used) | Keep **express-oauth2-jwt-bearer** only |
| DB migrations | `node-pg-migrate` (unused) + `knex` (used) | Keep **knex** only |

## Security / Outdated

| Package | Installed | Current | Issue |
|---------|-----------|---------|-------|
| `multer` | `1.4.5-lts.1` | v2.0.2 | **Security vulnerability** — DoS via memory leak in <2.0 |
| `multer-storage-cloudinary` | `4.0.0` | 4.0.0 | **Unmaintained** — last updated 6 years ago; conflicts with Cloudinary v2 |
| `cloudinary` | `^1.41.3` | v2.9.0 | Major version behind; v2 is recommended |
| `express` | `^4.21.1` | v5.2.1 | Express 5 is now stable (March 2025) |

## Module System Inconsistency

The project is `"type": "module"` (ESM), but one file uses CommonJS `require()` with ESM `export`:

- `routes/venue-ratings.js` — uses `const express = require('express')` + `export default router`

This should be converted to full ESM (`import express from 'express'`).

## Other Issues

- **`server.js:172`** references `process.env.REACT_APP_XENFORO_CLIENT_ID` — this is a frontend-style env var name; backend should use its own naming convention
- **Redundant dotenv loading** — `dotenv.config()` is called in 8+ files; should load once in `loadEnv.js` and remove from all other files

## Recommended Priorities

1. Evaluate `multer-storage-cloudinary` replacement (unmaintained)
1. Rename `REACT_APP_XENFORO_CLIENT_ID` to a backend-appropriate name
1. Consolidate dotenv loading to a single entry point
