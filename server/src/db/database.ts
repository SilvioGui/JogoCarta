import Database, { type Database as BetterDatabase } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/jogocarta.db';
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Performance e segurança
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('cache_size = -64000');
db.pragma('temp_store = MEMORY');

export function getDb(): BetterDatabase {
  return db;
}

export function closeDb() {
  db.close();
}
