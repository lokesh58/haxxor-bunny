export const BotName = 'Haxxor Bunny';

export const BotHomepageUrl = `https://${process.env.RAILWAY_STATIC_URL ?? `localhost:${process.env.PORT ?? 3000}`}`;

export const InternalBotInviteUrl = '/invite';

export const BotInviteUrl = `${BotHomepageUrl}${InternalBotInviteUrl}`;

export const ExternalBotInviteUrl =
  'https://discord.com/api/oauth2/authorize?client_id=823101978309427221&scope=applications.commands';
