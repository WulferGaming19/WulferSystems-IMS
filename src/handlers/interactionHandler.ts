import { Interaction, MessageFlags } from 'discord.js';
import { log } from '../utils/logging.js';
import db from '../db/database.js';

export async function handleInteraction(interaction: Interaction) {
  try {
    // 🎯 Channel-Auswahl im Selektion Menu
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'set_incident_channel') {
        const selectedChannel = interaction.values[0];

        db.prepare(
          `INSERT OR REPLACE INTO config (guild_id, incident_channel_id)
           VALUES (?, ?)`
        ).run(interaction.guildId, selectedChannel);

        return interaction.reply({
          content: `✅ Der Incident-Channel wurde erfolgreich gesetzt!`,
          flags: MessageFlags.Ephemeral,
        });
      }

      return interaction.reply({
        content: '❌ Dieses Auswahlmenü ist nicht bekannt.',
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (error) {
    log('error', `Fehler bei Interaktion: ${error}`);
  }
}
