import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from 'discord.js';

// 📦 Exportiere den Command mit Name und Beschreibung
export const data = new SlashCommandBuilder()
  .setName('beispiel')
  .setDescription('Ein funktionierender Testcommand')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('test')
      .setDescription('Ein Test Subcommand')
      .addStringOption((option) =>
        option
          .setName('text')
          .setDescription('Der Text, der angezeigt werden soll')
          .setRequired(true)
      )
  );

// .addSubCommand((subcommand) =>           //   subcommand
//     subcommand   //       .setName('test')               //   setName
//       .setDescription('Ein Test Subcommand') //   setDescription     //       .addStringOption((option) =>           //   addStringOption    //         option           //       .setName('text')               //   setName
//           .setDescription('Der Text, der angezeigt werden soll') //   setDescription     //         .setRequired(true)           //   setRequired

// 🚀 Die eigentliche Funktion, die bei Ausführung aufgerufen wird
export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply({
    content: '✅ Dieser Command funktioniert!',
    flags: MessageFlags.Ephemeral,
  });
}
function addSubCommand(arg0: (subcommand: any) => any) {
  throw new Error('Function not implemented.');
}
