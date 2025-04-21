import { Client, Collection, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv-safe';
dotenv.config();

import { log } from '../utils/logging.js';

// 📌 Hilfsfunktion für __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 Slash-Commands laden & registrieren
export async function loadCommands(client: Client) {
  client.commands = new Collection();
  const commandsToRegister = [];

  const basePath = path.join(__dirname, '..', 'commands');
  const folders = readdirSync(basePath);

  for (const folder of folders) {
    const folderPath = path.join(basePath, folder);
    const files = readdirSync(folderPath).filter((f) => f.endsWith('.ts'));

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      try {
        const commandModule = await import(pathToFileURL(filePath).href);
        if (commandModule.data && commandModule.execute) {
          client.commands.set(commandModule.data.name, commandModule);
          commandsToRegister.push(commandModule.data.toJSON());
          log('success', `Command geladen: /${commandModule.data.name}`);
        } else {
          log('warn', `Ungültiger Command in Datei: ${file}`);
        }
      } catch (err) {
        log('error', `Fehler beim Importieren von ${file}`);
        console.error(err);
      }
    }
  }

  // 📤 Slash Commands bei Discord registrieren
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    const registerType = process.env.REGISTER_TYPE?.toLowerCase();

    if (registerType === 'guild') {
      if (!process.env.GUILD_ID) {
        log('error', 'GUILD_ID fehlt in .env für Guild-Registrierung!');
        return;
      }

      log(
        'info',
        `📥 Registriere Commands nur auf Guild: ${process.env.GUILD_ID}`
      );
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID!,
          process.env.GUILD_ID
        ),
        { body: commandsToRegister }
      );
    } else {
      log('info', '🌐 Registriere Commands global (für alle Server)');
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
        body: commandsToRegister,
      });
    }

    log('success', 'Slash Commands erfolgreich registriert!');
  } catch (error) {
    log('error', 'Fehler bei der Slash Command Registrierung:');
    console.error(error);
  }
}
