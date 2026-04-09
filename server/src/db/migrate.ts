import { getDb } from './database';
import fs from 'fs';
import path from 'path';

export function runMigrations() {
  const db = getDb();

  // Garantir que a tabela de migrations existe
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const applied = db
    .prepare('SELECT name FROM migrations')
    .all() as { name: string }[];

  const appliedNames = new Set(applied.map(r => r.name));

  for (const file of files) {
    if (appliedNames.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
    db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
    console.log(`[Migration] Aplicada: ${file}`);
  }
}
