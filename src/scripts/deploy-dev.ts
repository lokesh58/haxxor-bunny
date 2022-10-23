import { Routes } from 'discord.js';
import commands from '../commands';
import { restClient } from '../utils/discord';

async function deployDev() {
  const commandsData = Object.values(commands).map((cmd) => cmd.data);
  await restClient.put(
    Routes.applicationGuildCommands(process.env.DISCORD_APP_ID!, process.env.DISCORD_DEV_GUILD_ID!),
    {
      body: commandsData,
    },
  );
  console.log('[dev] Commands Deployed successfully!');
}

function main() {
  deployDev();
}

main();
