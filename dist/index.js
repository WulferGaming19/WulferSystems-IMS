import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});
console.log('🚀 Der legendäre Bot wird gestartet...');
