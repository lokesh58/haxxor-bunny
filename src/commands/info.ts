import { ApplicationCommandType, InteractionResponseType, SnowflakeUtil } from 'discord.js';
import { BotHomepageUrl, BotInviteUrl, BotName } from '../utils/constants';
import HaxxorBunnyCommand, { BaseApplicationCommandHandler } from './base';

const InfoCommand: HaxxorBunnyCommand = {
  data: {
    name: 'info',
    description: 'Get some info about me',
    type: ApplicationCommandType.ChatInput,
  },
  CommandHandlerClass: class InfoCommandHandler extends BaseApplicationCommandHandler {
    public async handle(): Promise<void> {
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const msg = await this.getOriginalResponse();
      const interactionCreatedTs = SnowflakeUtil.timestampFrom(this.interaction.id);
      const interactionRespondedTs = SnowflakeUtil.timestampFrom(msg.id);
      const latency = interactionRespondedTs - interactionCreatedTs;
      const infos = [
        `🏠 **Homepage:** ${BotHomepageUrl}`,
        `🔗 **Invite URL:** ${BotInviteUrl}`,
        `⌛ **Roundtrip Latency:** ${latency}ms`,
      ];
      this.editOriginalResponse({
        embeds: [
          {
            title: `${BotName}'s Info`,
            description: infos.join('\n'),
          },
        ],
      });
    }
  },
};

export default InfoCommand;
