# pastey

A no-login image sharing webapp. Paste or drop an image, get a link, it disappears on schedule.

[View Demo](https://pastey.geoffoliver.me)

## Features

- Paste (`Cmd/Ctrl+V`) or drag & drop to share an image
- Accepts PNG, JPG, and WEBP — all uploads are converted to WebP and stripped of EXIF/metadata
- Configurable expiry: 1 hour up to 1 week
- Optional "delete after N views" with bot-resistant view counting (link previews and crawlers don't count)
- Uploader's own views never count against the view limit (cookie-based)
- Automatic cleanup runs every 30 minutes
- URL is copied to the clipboard automatically after upload
- Tasteful IE6-era 404 page

## Tech stack

| Concern | Choice |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Language | TypeScript |
| Web server | Express 5 |
| Database | SQLite via `bun:sqlite` |
| Scheduling | `cron` |
| Image processing | `sharp` |

## Configuration

### `config.json`

| Key | Type | Default | Description |
|---|---|---|---|
| `reallyDeleteFiles` | boolean | `true` | When `true`, expired files are deleted from disk. When `false`, only the database record is removed, making the file inaccessible but leaving it on disk. |

### `.env`

Copy `.env.example` to `.env` and adjust as needed. Bun loads this automatically.

```
PORT=3000
```

## Development

```bash
yarn install
yarn dev      # hot-reloading via bun --hot
```

## Production

### First-time setup

Run `init-pm2.sh` once on the server to install pm2, pm2-logrotate, and start the app:

```bash
bash init-pm2.sh
```

## Directory structure

```
pastey/
├── config.json          # app configuration
├── .env                 # environment variables (not committed)
├── src/
│   ├── index.ts         # Express server + routes
│   ├── db.ts            # SQLite setup and schema
│   ├── scheduler.ts     # cron-based expiry cleanup
│   └── config.ts        # typed config loader
├── public/
│   ├── index.html       # sharing UI
│   └── 404.html         # error page
├── uploads/             # uploaded files (YYYY/MM/DD/uuid.webp)
├── pastey.db            # SQLite database
├── init-pm2.sh          # first-time server setup
```
