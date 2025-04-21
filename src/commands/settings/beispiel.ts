import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from 'discord.js';

// 📦 Exportiere den Command mit Name und Beschreibung
export const data = new SlashCommandBuilder()
  .setName('beispiel')
  .setDescription('Ein funktionierender Testcommand');

// 🚀 Die eigentliche Funktion, die bei Ausführung aufgerufen wird
export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply({
    content: '✅ Dieser Command funktioniert!',
    flags: MessageFlags.Ephemeral,
  });
}
