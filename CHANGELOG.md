# Changelog

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
