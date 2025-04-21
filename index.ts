import { Client, GatewayIntentBits, Events } from 'discord.js'; // Import der Module aus discord.js// für die .env Datei
import dotenv from 'dotenv-safe';
import { initBotStatus } from './src/db/database.js';
import { performance } from 'node:perf_hooks';

import { log } from './src/utils/logging.js';

// laden der .env Datei
dotenv.config();

const startTime = performance.now(); // ⏱ Start

// Verwendung der Discord Intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Kleiner Check, ob der Bot erfolgreich gestartet ist
client.once(Events.ClientReady, async () => {
  log('success', `Erfolgreich eingeloggt als: ${client.user?.tag}`);
  log('success', `${client.user?.tag} ist erfolgreich gestartet!`);
  initBotStatus(); // Startzeit in DB speichern

  const endTime = performance.now(); // ⏱ Stop
  const duration = (endTime - startTime).toFixed(2); // Annahme der Zeit
  log('info', `Startzeit: ${duration} ms`); // Info Log mit der dauer des startens
});

// Fehlermeldung, wenn der Bott nicht starten kann
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  log('error', 'Bot konnte nicht starten!');
  log('error', `Grund: ${error.message || error}`); // Grund für das nicht starten
  process.exit(1); // Beendigung der Instanz
});
