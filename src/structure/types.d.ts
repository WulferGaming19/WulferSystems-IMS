import { Client, Collection } from 'discord.js';

// ✅ Erweitert den Discord.js Client mit deiner `commands` Collection
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, any>;
  }
}

//  Dies habe ich übernommen // # Nicht selbst geschrieben!
