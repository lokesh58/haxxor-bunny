import { Routes } from 'discord.js';
import commands from '../commands';
import { restClient } from '../utils/discord';

async function deployGlobal() {
  const globalCommandsData = Object.values(commands).map((cmd) => cmd.data);
  await restClient.put(Routes.applicationCommands(process.env.DISCORD_APP_ID!), {
    body: globalCommandsData,
  });
  console.log('Global Commands Deployed successfully!');
}

function main() {
  deployGlobal();
}

main();
