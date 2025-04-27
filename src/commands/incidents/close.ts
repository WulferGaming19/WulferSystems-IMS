import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  TextChannel,
  ChannelType,
  EmbedBuilder,
} from 'discord.js';
import db from '../../db/database.js';

export const data = new SlashCommandBuilder()
  .setName('incident')
  .setDescription('Verwaltung von Incidents')
  .addSubcommand((sub) =>
    sub
      .setName('close')
      .setDescription('Schließt einen Incident')
      .addIntegerOption((opt) =>
        opt
          .setName('id')
          .setDescription('ID des zu schließenden Incidents')
          .setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const incidentId = interaction.options.getInteger('id', true);
  const guildId = interaction.guildId;

  const config = db
    .prepare('SELECT incident_channel_id FROM config WHERE guild_id = ?')
    .get(guildId) as { incident_channel_id: string } | undefined;

  if (!config?.incident_channel_id) {
    return interaction.reply({
      content: '❌ Kein Incident-Channel konfiguriert.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const incident = db
    .prepare('SELECT * FROM incidents WHERE id = ?')
    .get(incidentId) as
    | {
        id: number;
        title: string;
        description: string;
        severity: string;
        status: string;
        channelMessageId: string;
      }
    | undefined;

  if (!incident) {
    return interaction.reply({
      content: '❌ Kein Incident mit dieser ID gefunden.',
      flags: MessageFlags.Ephemeral,
    });
  }

  if (incident.status === 'closed') {
    return interaction.reply({
      content: '❌ Dieser Incident ist bereits geschlossen.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = await interaction.guild?.channels.fetch(
    config.incident_channel_id
  );

  if (!channel || channel.type !== ChannelType.GuildText) {
    return interaction.reply({
      content: '❌ Der Incident-Channel ist ungültig.',
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    const message = await (channel as TextChannel).messages.fetch(
      incident.channelMessageId
    );

    const oldEmbed = message.embeds[0];

    if (!oldEmbed) {
      throw new Error('Kein Embed gefunden.');
    }

    const updatedEmbed = EmbedBuilder.from(oldEmbed)
      .setColor(0x57f287) // Setze Farbe auf Grün beim Schließen
      .setDescription(
        oldEmbed.data.description?.replace('🟡 Offen', '🟢 Geschlossen') || ''
      );

    await message.edit({ embeds: [updatedEmbed], components: [] });
  } catch (error) {
    console.error('Fehler beim Bearbeiten der Nachricht:', error);
    return interaction.reply({
      content: '❌ Fehler beim Aktualisieren der Incident-Nachricht.',
      flags: MessageFlags.Ephemeral,
    });
  }

  db.prepare('UPDATE incidents SET status = ? WHERE id = ?').run(
    'closed',
    incidentId
  );

  await interaction.reply({
    content: `✅ Incident #${incidentId} wurde erfolgreich geschlossen.`,
    flags: MessageFlags.Ephemeral,
  });
}
