import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | null = null;

function getDb(): DB {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL environment variable is required');
    const client = postgres(url, { max: 10, idle_timeout: 20, connect_timeout: 10 });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export const db = new Proxy({} as DB, {
  get(_, prop: string | symbol) {
    return getDb()[prop as keyof DB];
  },
});

export type Database = DB;
