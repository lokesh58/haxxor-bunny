import { ApplicationCommandType, InteractionResponseType, SnowflakeUtil } from 'discord.js';
import { BotHomepageUrl, BotInviteUrl, BotName } from '../constants';
import { getBaseAppUrl } from '../utils';
import HaxxorBunnyCommand, { BaseChatInputApplicationCommandHandler } from './base';

const InfoCommand: HaxxorBunnyCommand = {
  data: {
    type: ApplicationCommandType.ChatInput,
    name: 'info',
    description: 'Get some info about me',
  },
  CommandHandler: class InfoCommandHandler extends BaseChatInputApplicationCommandHandler {
    public async handle(): Promise<void> {
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const msg = await this.getOriginalResponse();
      const interactionCreatedTs = SnowflakeUtil.timestampFrom(this.interaction.id);
      const interactionRespondedTs = SnowflakeUtil.timestampFrom(msg.id);
      const latency = interactionRespondedTs - interactionCreatedTs;
      const infos = [
        `🏠 **Homepage:** ${new URL(BotHomepageUrl, getBaseAppUrl())}`,
        `🔗 **Invite URL:** ${new URL(BotInviteUrl, getBaseAppUrl())}`,
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
