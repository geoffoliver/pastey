# Changelog

## [0.0.4] - 2026-04-22

### Added

- `Dockerfile` using `oven/bun:1` as the base image; builds for `linux/amd64` and `linux/arm64`
- `docker-compose.yml` pulling from `ghcr.io/geoffoliver/pastey:latest` with named volumes for uploads (`pastey_uploads`) and database (`pastey_data`)
- `.github/workflows/docker-publish.yml` — GitHub Actions workflow that builds and pushes the image to the GitHub Container Registry on every push to `main` and on `v*.*.*` tags; no extra secrets required (uses `GITHUB_TOKEN`)
- `tsconfig.json` for correct IDE type resolution
- `DATABASE_PATH` environment variable support in `src/db.ts` so the SQLite database path is configurable (used by Docker to place the DB in a named volume)
- Docker quick-start and environment variable documentation added to `README.md`

## [0.0.3] - 2026-04-22

### Fixed

- Set `trust proxy` on the Express app so `express-rate-limit` can correctly identify client IPs when running behind a reverse proxy, eliminating the `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` warning

### Changed

- After a successful upload the UI now resets back to the dropzone rather than navigating away — the image opens in a new tab, all options reset to defaults, and the selected file is cleared
- A dismissible toast notification slides up from the bottom confirming "Link copied to clipboard!" (or a fallback message if clipboard access was denied); the toast persists until explicitly dismissed or until a new image is selected via paste, drop, or tap

## [0.0.2] - 2026-04-22

### Added

- CSRF protection via the double-submit cookie pattern — `GET /` sets a `pastey_csrf` cookie (readable by JS, `SameSite: Strict`); the upload page echoes it back as an `X-CSRF-Token` header, and the server rejects any request where they don't match
- Rate limiting on `POST /upload`: 5 uploads per IP per 10 minutes via `express-rate-limit`; over-limit requests receive a `429` with a human-readable error message shown in the UI
- Mobile support: tap-to-select via a hidden file input, context-aware dropzone copy ("Tap to select" on mobile vs. "Paste or drag & drop" on desktop), top-aligned scrollable layout on narrow screens, iOS zoom-prevention (`font-size: 1rem`) on form inputs, tighter padding at small breakpoints
- GitHub repo link (`geoffoliver/pastey`) fixed to the bottom-right corner of the sharing page

## [0.0.1] - 2026-04-22

Initial release.

### Added

- Sharing UI — paste (`Cmd/Ctrl+V`) or drag & drop an image to upload
- Accepts PNG, JPG, and WEBP; all uploads converted to WebP with EXIF/metadata stripped via `sharp`
- 20 MB file size limit enforced on both client and server
- Configurable expiry: 1 hour, 12 hours, 1 day, 3 days, 5 days, or 1 week (default)
- "Delete after N views" option with bot-resistant view counting (crawlers and link-preview scrapers excluded)
- Cookie-based uploader tracking so the sharer's own views never count against the view limit
- URL copied to clipboard automatically on successful upload
- Scheduled cleanup job runs every 30 minutes to purge expired uploads
- `config.json` with `reallyDeleteFiles` flag (hard-delete vs. soft-delete)
- `PORT` configurable via `.env` (loaded natively by Bun)
- IE6-style "The page cannot be displayed" 404 page
- `init-pm2.sh` for first-time server setup (pm2 + pm2-logrotate + app start)
- `deploy.sh` for rsync-based deployment with automatic dependency install and pm2 restart
