import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  TextChannel,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

import db from '../../db/database.js';

const severityEmojis: Record<
  string,
  { emoji: string; label: string; color: number }
> = {
  kritisch: { emoji: '🟥', label: 'Kritisch', color: 0xff0000 },
  hoch: { emoji: '🟧', label: 'Hoch', color: 0xff8000 },
  mittel: { emoji: '🟨', label: 'Mittel', color: 0xffff00 },
  niedrig: { emoji: '🟦', label: 'Niedrig', color: 0x3366cc },
  info: { emoji: '🟩', label: 'Info', color: 0x33cc33 },
};

export const data = new SlashCommandBuilder()
  .setName('incident')
  .setDescription('Verwaltung von Incidents')
  .addSubcommand((sub) =>
    sub
      .setName('create')
      .setDescription('Erstellt ein neues Incident im GalaxyBot-Stil')
      .addStringOption((opt) =>
        opt
          .setName('title')
          .setDescription('Titel des Incidents')
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName('description')
          .setDescription('Beschreibung des Incidents')
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName('severity')
          .setDescription('Schwere des Incidents')
          .setRequired(true)
          .addChoices(
            { name: '🟥 Kritisch', value: 'kritisch' },
            { name: '🟧 Hoch', value: 'hoch' },
            { name: '🟨 Mittel', value: 'mittel' },
            { name: '🟦 Niedrig', value: 'niedrig' },
            { name: '🟩 Info', value: 'info' }
          )
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const title = interaction.options.getString('title', true);
  const description = interaction.options.getString('description', true);
  const severity = interaction.options.getString('severity', true);
  const guildId = interaction.guildId;
  const createdAt = new Date();

  const config = db
    .prepare('SELECT incident_channel_id FROM config WHERE guild_id = ?')
    .get(guildId) as { incident_channel_id: string };

  if (!config?.incident_channel_id) {
    return interaction.reply({
      content:
        '❌ Kein Incident-Channel konfiguriert. Bitte verwende /settings.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = await interaction.guild?.channels.fetch(
    config.incident_channel_id
  );
  if (!channel || channel.type !== ChannelType.GuildText) {
    return interaction.reply({
      content: '❌ Der konfigurierte Channel ist ungültig.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const result = db
    .prepare(
      `INSERT INTO incidents (title, description, severity, channelMessageId, created_at)
         VALUES (?, ?, ?, ?, ?)`
    )
    .run(title, description, severity, 'placeholder', createdAt.toISOString());

  const incidentId = result.lastInsertRowid as number;
  const timestampUnix = Math.floor(createdAt.getTime() / 1000);
  const formattedDate = createdAt.toLocaleString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const descriptionEntry = `**<t:${timestampUnix}:F>**\n${description}`;
  const severityInfo = severityEmojis[severity];

  const embed = new EmbedBuilder()
    .setColor(severityInfo?.color || 0x2f3136)
    .setTitle(`❗ Incident #${incidentId} – ${title}`)
    .setDescription(descriptionEntry)
    .setFooter({
      text: `${severityInfo.emoji} ${severityInfo.label}   •   🕒 Erstellt: ${formattedDate}   •   🟡 Status: Offen`,
    })
    .setTimestamp(createdAt);

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('incident_append')
      .setLabel('Info anhängen')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🧩'),
    new ButtonBuilder()
      .setCustomId('incident_close')
      .setLabel('Schließen')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🔒')
  );

  const message = await (channel as TextChannel).send({
    embeds: [embed],
    components: [buttons],
  });

  db.prepare(`UPDATE incidents SET channelMessageId = ? WHERE id = ?`).run(
    message.id,
    incidentId
  );

  await interaction.reply({
    content: `✅ Incident #${incidentId} wurde erfolgreich erstellt.`,
    flags: MessageFlags.Ephemeral,
  });
}
