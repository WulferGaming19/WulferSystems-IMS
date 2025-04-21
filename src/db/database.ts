import Database from 'better-sqlite3';

const db = new Database('./data/botdata.db');

export function initBotStatus() {
  db.prepare(
    `
      CREATE TABLE IF NOT EXISTS bot_status (
        id INTEGER PRIMARY KEY,
        last_start TEXT
      )
    `
  ).run();

  const now = new Date().toISOString();

  db.prepare(
    `
      INSERT OR REPLACE INTO bot_status (id, last_start)
      VALUES (1, ?)
    `
  ).run(now);
}

export default db;
