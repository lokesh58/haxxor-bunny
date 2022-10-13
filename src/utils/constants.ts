export const BotName = 'Haxxor Bunny';

export const BotOwnerIds = process.env.DISCORD_BOT_OWNER_IDS!.split(',');

export const BotHomepageUrl = 'https://haxxor-bunny.vercel.app';

export const InternalBotInviteUrl = '/invite';

export const BotInviteUrl = `${BotHomepageUrl}${InternalBotInviteUrl}`;

export const ExternalBotInviteUrl =
  'https://discord.com/api/oauth2/authorize?client_id=823101978309427221&scope=applications.commands';
