import { Client, GatewayIntentBits, Events } from 'discord.js'; // Import der Module aus discord.js// für die .env Datei
import dotenv from 'dotenv-safe';
import { initBotStatus } from './src/db/database.js';
import { performance } from 'node:perf_hooks';

import { log } from './src/utils/logging.js';
import { loadCommands } from './src/handlers/commandHandler.js';

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
  await loadCommands(client); // Lade die Commands
  log('success', 'Alle Commands wurden erfolgreich geladen!');

  const endTime = performance.now(); // ⏱ Stop
  const duration = (endTime - startTime).toFixed(2); // Annahme der Zeit
  log('info', `Startzeit: ${duration} ms`); // Info Log mit der dauer des startens
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log('Command erkannt:', interaction.commandName);

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.warn('Command nicht gefunden:', interaction.commandName);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Fehler bei Command-Ausführung:', error);
    if (!interaction.replied) {
      await interaction.reply({
        content:
          '❌ Beim Ausführen dieses Commands ist ein Fehler aufgetreten.',
        ephemeral: true,
      });
    }
  }
});

// Fehlermeldung, wenn der Bott nicht starten kann
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  log('error', 'Bot konnte nicht starten!');
  log('error', `Grund: ${error.message || error}`); // Grund für das nicht starten
  process.exit(1); // Beendigung der Instanz
});
