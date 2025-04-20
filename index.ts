import { Client, GatewayIntentBits, Events } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user?.tag} ist erfolgreich gestartet.`);
  });

client.login(process.env.DISCORD_TOKEN)