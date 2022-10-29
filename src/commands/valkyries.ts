import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord.js';
import { isValidObjectId, Types } from 'mongoose';
import { z } from 'zod';
import { getValkyriesByKeyword } from '../utils/hi3';
import HaxxorBunnyCommand, {
  BaseApplicationCommandAutocompleteHandler,
  BaseChatInputApplicationCommandHandler,
} from './base';

const ValkyriesCommand: HaxxorBunnyCommand = {
  data: {
    type: ApplicationCommandType.ChatInput,
    name: 'valkyries',
    description: 'View information about valkyries',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'valk',
        description: 'Valkyrie to get information about',
        autocomplete: true,
        required: false,
      },
    ],
  },
  CommandHandler: class ValkyriesCommandHandler extends BaseChatInputApplicationCommandHandler {
    public handle(): Promise<void> {
      const args = this.getParsedArguments(
        z.object({
          valk: z
            .string()
            .refine((v) => isValidObjectId(v), { message: 'Invalid Valkyrie ID' })
            .transform((v) => new Types.ObjectId(v))
            .optional(),
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
  CommandAutocompleteHandler: class ValkyriesCommandAutocompleteHandler extends BaseApplicationCommandAutocompleteHandler {
    public async handle(): Promise<void> {
      const { value } = this.getFocusedOption();
      const valkyries = await getValkyriesByKeyword(value.toString());
      return this.respond({
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: {
          choices: valkyries.map((v) => ({ name: v.name, value: v._id.toString() })),
        },
      });
    }
  },
};

export default ValkyriesCommand;
