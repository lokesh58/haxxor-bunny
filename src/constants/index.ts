export const BotName = 'Haxxor Bunny';

export const BotBaseUrl = process.env.RAILWAY_STATIC_URL
  ? `https://${process.env.RAILWAY_STATIC_URL}`
  : `http://localhost:${process.env.PORT ?? 3000}`;

export const BotHomepageUrl = BotBaseUrl;

export const InternalBotInviteUrl = '/invite';

export const BotInviteUrl = `${BotBaseUrl}${InternalBotInviteUrl}`;

export const ExternalBotInviteUrl =
  'https://discord.com/api/oauth2/authorize?client_id=823101978309427221&scope=applications.commands';
