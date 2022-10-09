import { ApplicationCommandType, Awaitable, InteractionResponseType } from 'discord.js';
import { BotHomepageUrl, BotInviteUrl, BotName } from '../utils/constants';
import HaxxorBunnyCommand, { BaseApplicationCommandHandler } from './base';

const InfoCommand: HaxxorBunnyCommand = {
  data: {
    name: 'info',
    description: 'Get some info about me',
    type: ApplicationCommandType.ChatInput,
  },
  CommandHandlerClass: class InfoCommandHandler extends BaseApplicationCommandHandler {
    public handle(): Awaitable<void> {
      const infos = [`🏠 **Homepage:** ${BotHomepageUrl}`, `🔗 **Invite URL:** ${BotInviteUrl}`];
      this.res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          embeds: [
            {
              title: `${BotName}'s Info`,
              description: infos.join('\n'),
            },
          ],
        },
      });
    }
  },
};

export default InfoCommand;
