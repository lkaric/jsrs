import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/index';

export type Database = ReturnType<typeof drizzle<typeof schema>>;

let _db: Database | null = null;

function getDb(): Database {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL environment variable is required');
    _db = drizzle(neon(url), { schema });
  }
  return _db;
}

/**
 * Drizzle instance backed by Neon's HTTP driver.
 *
 * Each query is a stateless HTTP POST — no persistent TCP socket, no
 * cross-request I/O sharing. Safe to use as a module-level singleton in
 * Cloudflare Workers. Lazily initialised on first use so process.env is
 * read inside a request handler rather than at module load time.
 */
export const db = new Proxy({} as Database, {
  get(_, prop: string | symbol) {
    return getDb()[prop as keyof Database];
  },
});
