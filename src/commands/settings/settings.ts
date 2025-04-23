import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  MessageFlags,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Konfiguriere deinen Server für Incident-Management');

export async function execute(interaction: ChatInputCommandInteraction) {
  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId('select_incident_channel')
    .setPlaceholder('🔧 Wähle den Incident-Channel aus')
    .setChannelTypes(ChannelType.GuildText)
    .setMinValues(1)
    .setMaxValues(1);

  const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
    channelSelect
  );

  await interaction.reply({
    content: 'Bitte wähle den Incident-Channel aus:',
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}
