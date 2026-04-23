# Changelog

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
