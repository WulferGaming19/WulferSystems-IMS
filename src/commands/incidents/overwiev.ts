import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import db from '../../db/database.js';

export const data = new SlashCommandBuilder()
  .setName('incident-overview')
  .setDescription('Liste aller offenen Incidents anzeigen');

export async function execute(interaction: ChatInputCommandInteraction) {
  const incidents = db
    .prepare('SELECT id, title, status FROM incidents')
    .all() as { id: number; title: string; status: 'offen' | 'geschlossen' }[];

  const embed = new EmbedBuilder()
    .setTitle('📋 Aktuelle Incidents')
    .setDescription(
      incidents.length
        ? incidents
            .map(
              (i) =>
                `> **${i.id}** – ${i.title} (${i.status === 'offen' ? '🟡 Offen' : '✅ Geschlossen'})`
            )
            .join('\n')
        : 'Keine Incidents gefunden.'
    )
    .setColor(0x5865f2);

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}
