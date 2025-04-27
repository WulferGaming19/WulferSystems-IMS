import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  MessageFlags,
} from 'discord.js';
import db from '../../db/database.js';

type Config = {
  incident_channel_id: string | null;
  log_channel_id: string | null;
};

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Konfiguriere die Bot-Einstellungen');

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId;

  const config = db
    .prepare(
      'SELECT incident_channel_id, log_channel_id FROM config WHERE guild_id = ?'
    )
    .get(guildId) as Config | undefined;

  const embed = new EmbedBuilder()
    .setTitle('🛠️ Server-Einstellungen')
    .setDescription('Hier sind die aktuellen Konfigurationen:')
    .setColor(0x5865f2)
    .addFields(
      {
        name: '📢 Incident-Channel',
        value: config?.incident_channel_id
          ? `<#${config.incident_channel_id}>`
          : '❌ Nicht gesetzt',
        inline: true,
      },
      {
        name: '📄 Log-Channel',
        value: config?.log_channel_id
          ? `<#${config.log_channel_id}>`
          : '❌ Nicht gesetzt',
        inline: true,
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('settings_incident_channel')
      .setLabel('📢 Incident-Channel setzen')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('settings_log_channel')
      .setLabel('📄 Log-Channel setzen')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}
