import { CronJob } from 'cron';
import { unlink } from 'fs/promises';
import path from 'path';
import { db } from './db';
import { config } from './config';

interface ExpiredRow {
  id: string;
  path: string;
}

export function startScheduler(): void {
  const job = new CronJob('*/30 * * * *', async () => {
    const now = Date.now();

    const expired = db
      .query<ExpiredRow, [number]>('SELECT id, path FROM uploads WHERE delete_at <= ?')
      .all(now);

    for (const row of expired) {
      db.run('DELETE FROM uploads WHERE id = ?', [row.id]);
      if (config.reallyDeleteFiles) {
        await unlink(path.join(process.cwd(), row.path)).catch(() => {});
      }
    }

    if (expired.length > 0) {
      console.log(`Scheduler: removed ${expired.length} expired upload(s)`);
    }
  });

  job.start();
}
