import {
  Interaction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  MessageFlags,
} from 'discord.js';
import db from '../db/database.js';
import { log } from '../utils/logging.js';

export async function handleInteraction(interaction: Interaction) {
  if (!interaction.isButton()) return;

  try {
    switch (interaction.customId) {
      case 'settings_incident_channel': {
        await interaction.reply({
          content: 'Bitte wähle den neuen Incident-Channel aus:',
          components: [
            {
              type: 1,
              components: [
                {
                  type: 8,
                  custom_id: 'select_incident_channel',
                  channel_types: [0], // Nur Textkanäle
                  placeholder: 'Wähle einen Kanal...',
                },
              ],
            },
          ],
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      case 'settings_log_channel': {
        await interaction.reply({
          content: 'Bitte wähle den neuen Log-Channel aus:',
          components: [
            {
              type: 1,
              components: [
                {
                  type: 8,
                  custom_id: 'select_log_channel',
                  channel_types: [0],
                  placeholder: 'Wähle einen Kanal...',
                },
              ],
            },
          ],
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      case 'incident_append': {
        await interaction.reply({
          content: '➕ Bald kannst du Infos anhängen! 🚀',
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      case 'incident_close': {
        await interaction.reply({
          content: '✅ Bald kannst du Incidents schließen!',
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      default: {
        await interaction.reply({
          content: '❌ Dieser Button ist nicht bekannt.',
          flags: MessageFlags.Ephemeral,
        });
        break;
      }
    }
  } catch (error) {
    log('error', `Fehler bei Button-Interaktion: ${error}`);
  }
}
