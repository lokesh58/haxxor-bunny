import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord.js';
import { z } from 'zod';
import { getUserValkyrieDisplayEmbeds } from '../utils/hi3';
import HaxxorBunnyCommand, { BaseChatInputApplicationCommandHandler } from './base';

const UserValkyriesCommand: HaxxorBunnyCommand = {
  data: {
    type: ApplicationCommandType.ChatInput,
    name: 'user-valkyries',
    description: 'View valkyries of a user',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'The user whose valkyrie to view',
        required: true,
      },
    ],
  },
  CommandHandler: class UserValkyriesCommandHandler extends BaseChatInputApplicationCommandHandler {
    public async handle(): Promise<void> {
      const args = this.getParsedArguments(
        z.object({
          user: z.string().regex(/^\d+$/, { message: 'Invalid User ID' }),
        }),
      );
      const { user: userId } = args;
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const embeds = await getUserValkyrieDisplayEmbeds(userId);
      for (const embed of embeds) {
        await this.createFollowup({ embeds: [embed] });
      }
    }
  },
};

export default UserValkyriesCommand;
