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

## Docker

The easiest way to run pastey. Images are published to the GitHub Container Registry automatically on every push to `main`.

```bash
# Download docker-compose.yml
curl -O https://raw.githubusercontent.com/geoffoliver/pastey/main/docker-compose.yml

# Start
docker compose up -d
```

The app will be available at `http://localhost:3000`. Uploads and the database are stored in named Docker volumes (`pastey_uploads` and `pastey_data`) so they survive container restarts and upgrades.

To update to the latest image:

```bash
docker compose pull && docker compose up -d
```

### Environment variables (Docker)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the app listens on inside the container |
| `DATABASE_PATH` | `/app/data/pastey.db` | Path to the SQLite database file |

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
├── Dockerfile
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── docker-publish.yml   # builds & pushes image to ghcr.io
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
