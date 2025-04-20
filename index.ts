import { Client, GatewayIntentBits, Events } from 'discord.js'; // Import der Module aus discord.js// für die .env Datei
import dotenv from 'dotenv-safe';
import Database from 'better-sqlite3';

// laden der .env Datei
dotenv.config();

// Datenbank Pfad setzung
const db = new Database('src/db/botdata.db');

// Verwendung der Discord Intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Kleiner Check, ob der Bot erfolgreich gestartet ist
client.once(Events.ClientReady, () => {
  console.log(`✅ ${client.user?.tag} ist erfolgreich gestartet.`);
});

// Fehlermeldung, wenn kein Token angegeben worden ist oder ein feher auftritt
// # Recherce für Fehlermeldung erforderlich

// Abfrage und auszug des Bot Tokens aus der .env
client.login(process.env.DISCORD_TOKEN);
