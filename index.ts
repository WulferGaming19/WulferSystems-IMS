import { Client, GatewayIntentBits, Events } from 'discord.js'; // Import der Module aus discord.js// für die .env Datei
import dotenv from 'dotenv-safe';
import Database from 'better-sqlite3';
import { performance } from 'node:perf_hooks';

import { log } from './src/utils/logging.js';

// laden der .env Datei
dotenv.config();

// Datenbank Pfad setzung
const db = new Database('src/db/botdata.db');

// Hier dann als Test eine Speicherung des letzten Bot startes in der Datenbank
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS bot_status (
    id INTEGER PRIMARY KEY,
    last_start TEXT
  )
`
).run();

const startTime = performance.now(); // ⏱ Start

// Verwendung der Discord Intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Kleiner Check, ob der Bot erfolgreich gestartet ist
client.once(Events.ClientReady, async () => {
  log('success', `Erfolgreich eingeloggt als: ${client.user?.tag}`);
  log('success', `${client.user?.tag} ist erfolgreich gestartet!`);

  const endTime = performance.now(); // ⏱ Stop
  const duration = (endTime - startTime).toFixed(2);
  log('info', `Startzeit: ${duration} ms`); // Info Log
});

// Fehlermeldung, wenn kein Token angegeben worden ist oder ein feher auftritt
// # Recherce für Fehlermeldung erforderlich

// Abfrage und auszug des Bot Tokens aus der .env
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  log('error', 'Bot konnte nicht starten!');
  log('error', `Grund: ${error.message || error}`);
  process.exit(1);
});
