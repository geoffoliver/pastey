import { Database } from 'bun:sqlite';
import path from 'path';

export const db = new Database(path.join(process.cwd(), 'pastey.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS uploads (
    id                 TEXT    PRIMARY KEY,
    path               TEXT    NOT NULL UNIQUE,
    created_at         INTEGER NOT NULL,
    delete_at          INTEGER NOT NULL,
    delete_after_views INTEGER,
    view_count         INTEGER NOT NULL DEFAULT 0,
    uploader_id        TEXT
  )
`);

// Migration: add uploader_id to existing databases
try {
  db.exec('ALTER TABLE uploads ADD COLUMN uploader_id TEXT');
} catch {
  // Column already exists
}
