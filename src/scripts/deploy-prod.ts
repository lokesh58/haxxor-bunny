import { Routes } from 'discord.js';
import commands from '../commands';
import { restClient } from '../utils/discord';

async function deployProd() {
  const globalCommandsData = Object.values(commands)
    .filter((cmd) => !cmd.ownerOnly)
    .map((cmd) => cmd.data);
  await restClient.put(Routes.applicationCommands(process.env.DISCORD_APP_ID!), {
    body: globalCommandsData,
  });
  console.log('Global Commands Deployed successfully!');

  const ownerCommandsData = Object.values(commands)
    .filter((cmd) => cmd.ownerOnly)
    .map((cmd) => cmd.data);
  await restClient.put(
    Routes.applicationGuildCommands(process.env.DISCORD_APP_ID!, process.env.DISCORD_DEV_GUILD_ID!),
    { body: ownerCommandsData },
  );
  console.log('Owner Commands Deployed successfully!');
}

function main() {
  deployProd();
}

main();
