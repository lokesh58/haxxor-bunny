import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord.js';
import { z } from 'zod';
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
        required: false,
      },
    ],
  },
  CommandHandler: class UserValkyriesCommandHandler extends BaseChatInputApplicationCommandHandler {
    public handle(): Promise<void> {
      const args = this.getParsedArguments(
        z.object({
          user: z.string().regex(/^\d+$/, { message: 'Invalid User ID' }),
        }),
      );
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: JSON.stringify(args),
        },
      });
    }
  },
};

export default UserValkyriesCommand;
