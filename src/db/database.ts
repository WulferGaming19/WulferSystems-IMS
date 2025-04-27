import Database from 'better-sqlite3';
import chalk from 'chalk';

const db = new Database('./data/botdata.db');

// Tabelle config
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS config (
    guild_id TEXT PRIMARY KEY,
    incident_channel_id TEXT,
    log_channel_id TEXT
  )
`
).run();

// Tabelle incidents
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    channelMessageId TEXT,
    created_at TEXT NOT NULL
  )
`
).run();

// Tabelle bot_status
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS bot_status (
    id INTEGER PRIMARY KEY,
    last_start TEXT
  )
`
).run();

// ✅ Diese Funktion musst du EXPORTIEREN:
export function initBotStatus() {
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO bot_status (id, last_start)
    VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET last_start = excluded.last_start
  `
  ).run(now);

  console.log(chalk.gray(`📅 Letzter Start eingetragen: ${now}`));
}

export default db;
