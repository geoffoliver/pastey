import express, { type Request, type Response, type NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import path from 'path';
import { mkdir, unlink } from 'fs/promises';
import { db } from './db';
import { config } from './config';
import { startScheduler } from './scheduler';

// ── Express ───────────────────────────────────────────────────────────────────

const app = express();
app.set('trust proxy', 1);
app.use(cookieParser());
app.use(express.json());

// ── Multer ────────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and WEBP images are allowed'));
    }
  },
});

// ── Rate limiting & CSRF ──────────────────────────────────────────────────────

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many uploads. Please wait a few minutes and try again.' },
});

function validateCsrf(req: Request, res: Response, next: NextFunction): void {
  const cookie = req.cookies.pastey_csrf as string | undefined;
  const header = req.headers['x-csrf-token'] as string | undefined;
  if (!cookie || cookie !== header) {
    res.status(403).json({ error: 'Invalid request.' });
    return;
  }
  next();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const DURATIONS: Record<string, number> = {
  '1h':  1 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d':  24 * 60 * 60 * 1000,
  '3d':  3 * 24 * 60 * 60 * 1000,
  '5d':  5 * 24 * 60 * 60 * 1000,
  '1w':  7 * 24 * 60 * 60 * 1000,
};

const BOT_UA_RE =
  /bot|crawler|spider|scraper|preview|slack|facebook|twitter|linkedin|whatsapp|telegram|discord/i;

interface UploadRow {
  id: string;
  uploader_id: string | null;
  delete_after_views: number | null;
  view_count: number;
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/', (req: Request, res: Response) => {
  if (!req.cookies.pastey_csrf) {
    res.cookie('pastey_csrf', randomBytes(32).toString('hex'), {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: false, // must be readable by JS for the double-submit pattern
      sameSite: 'strict',
    });
  }
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// app.get('/ie.webp', (_req: Request, res: Response) => {
//   res.sendFile(path.join(process.cwd(), 'public', 'ie.webp'));
// });

app.use('/img', express.static(path.join(process.cwd(), 'public', 'web', 'img')));

app.use('/favicon.ico', express.static(path.join(process.cwd(), 'public', 'web', 'img', 'favicon.ico')));

app.post('/upload', uploadLimiter, validateCsrf, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image provided' });
    return;
  }

  const deleteAfter = (req.body.deleteAfter as string) ?? '1w';
  const deleteAfterViews = req.body.deleteAfterViews
    ? parseInt(req.body.deleteAfterViews, 10)
    : null;

  const durationMs = DURATIONS[deleteAfter] ?? DURATIONS['1w'];
  const now = Date.now();
  const deleteAt = now + durationMs;

  const date = new Date();
  const year     = date.getFullYear().toString();
  const month    = String(date.getMonth() + 1).padStart(2, '0');
  const day      = String(date.getDate()).padStart(2, '0');
  const filename = `${uuidv4()}.webp`;
  const relPath  = `uploads/${year}/${month}/${day}/${filename}`;
  const absDir   = path.join(process.cwd(), 'uploads', year, month, day);
  const absPath  = path.join(absDir, filename);

  await mkdir(absDir, { recursive: true });

  // Convert to webp; sharp strips all metadata by default
  await sharp(req.file.buffer).webp().toFile(absPath);

  const uploaderId = (req.cookies.pastey_uid as string | undefined) ?? uuidv4();
  res.cookie('pastey_uid', uploaderId, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });

  db.run(
    `INSERT INTO uploads (id, path, created_at, delete_at, delete_after_views, uploader_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), relPath, now, deleteAt, deleteAfterViews, uploaderId],
  );

  res.json({ url: `/${relPath}` });
});

// Track views before express.static handles delivery
app.use('/uploads', async (req: Request, res: Response, next: NextFunction) => {
  if (!req.path.endsWith('.webp')) return next();

  const relPath = `uploads${req.path}`;

  const row = db
    .query<UploadRow, [string]>(
      'SELECT id, uploader_id, delete_after_views, view_count FROM uploads WHERE path = ?',
    )
    .get(relPath);

  if (!row) {
    res.status(404).sendFile(path.join(process.cwd(), 'public', '404.html'));
    return;
  }

  const isBot = BOT_UA_RE.test(req.headers['user-agent'] ?? '');
  const isUploader = !!row.uploader_id && req.cookies.pastey_uid === row.uploader_id;
  if (!isBot && !isUploader) {
    const newCount = row.view_count + 1;
    db.run('UPDATE uploads SET view_count = ? WHERE id = ?', [newCount, row.id]);

    if (row.delete_after_views !== null && newCount >= row.delete_after_views) {
      db.run('DELETE FROM uploads WHERE id = ?', [row.id]);
      if (config.reallyDeleteFiles) unlink(path.join(process.cwd(), relPath)).catch(() => {});
      res.status(404).sendFile(path.join(process.cwd(), 'public', '404.html'));
      return;
    }
  }

  next();
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// generic 404 handler for everything else
app.use((_req: Request, res: Response) => {
  res.status(404).sendFile(path.join(process.cwd(), 'public', '404.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────

startScheduler();

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => console.log(`pastey running on port ${PORT}`));
