import { REST } from 'discord.js';

export const restClient = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);
