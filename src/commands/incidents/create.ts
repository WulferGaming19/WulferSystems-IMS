import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} from 'discord.js';
import db from '../../db/database.js';

type Severity = 'kritisch' | 'hoch' | 'mittel' | 'niedrig' | 'info';

const severityLevels: Record<
  Severity,
  { emoji: string; label: string; color: number }
> = {
  kritisch: { emoji: '🟥', label: 'Kritisch', color: 0xff0000 },
  hoch: { emoji: '🟧', label: 'Hoch', color: 0xff9900 },
  mittel: { emoji: '🟨', label: 'Mittel', color: 0xffcc00 },
  niedrig: { emoji: '🟦', label: 'Niedrig', color: 0x3399ff },
  info: { emoji: '🟩', label: 'Info', color: 0x33cc33 },
};

export const data = new SlashCommandBuilder()
  .setName('incident-create')
  .setDescription('Neuen Incident erstellen')
  .addStringOption((opt) =>
    opt.setName('title').setDescription('Titel des Incidents').setRequired(true)
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
      .setDescription('Schweregrad')
      .setRequired(true)
      .addChoices(
        { name: '🟥 Kritisch', value: 'kritisch' },
        { name: '🟧 Hoch', value: 'hoch' },
        { name: '🟨 Mittel', value: 'mittel' },
        { name: '🟦 Niedrig', value: 'niedrig' },
        { name: '🟩 Info', value: 'info' }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const title = interaction.options.getString('title', true);
  const description = interaction.options.getString('description', true);
  const severity = interaction.options.getString('severity', true) as Severity;
  const guildId = interaction.guildId;
  const createdAt = new Date();

  const config = db
    .prepare('SELECT incident_channel_id FROM config WHERE guild_id = ?')
    .get(guildId) as { incident_channel_id: string };
  if (!config?.incident_channel_id) {
    return interaction.reply({
      content: '❌ Kein Incident-Channel konfiguriert.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = await interaction.guild?.channels.fetch(
    config.incident_channel_id
  );
  if (!channel || channel.type !== ChannelType.GuildText) {
    return interaction.reply({
      content: '❌ Incident-Channel ungültig.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const severityInfo = severityLevels[severity];
  const result = db
    .prepare(
      'INSERT INTO incidents (title, description, severity, created_at) VALUES (?, ?, ?, ?)'
    )
    .run(title, description, severity, createdAt.toISOString());
  const incidentId = result.lastInsertRowid as number;

  const embed = new EmbedBuilder()
    .setColor(severityInfo.color)
    .setTitle(`❗ Incident #${incidentId} – ${title}`)
    .setDescription(
      `> **Status:** 🟡 Offen\n> **Schweregrad:** ${severityInfo.emoji} ${severityInfo.label}\n\n**<t:${Math.floor(createdAt.getTime() / 1000)}:F>**\n${description}`
    )
    .setFooter({
      text: `Erstellt am ${createdAt.toLocaleDateString('de-DE')} um ${createdAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`,
    });

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('incident_append')
      .setLabel('➕ Info anhängen')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('incident_close')
      .setLabel('✅ Schließen')
      .setStyle(ButtonStyle.Secondary)
  );

  const message = await (channel as TextChannel).send({
    embeds: [embed],
    components: [buttons],
  });
  db.prepare('UPDATE incidents SET channelMessageId = ? WHERE id = ?').run(
    message.id,
    incidentId
  );

  await interaction.reply({
    content: `✅ Incident #${incidentId} erstellt!`,
    flags: MessageFlags.Ephemeral,
  });
}
