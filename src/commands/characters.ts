import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord.js';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { getCharactersByKeyword } from '../utils/hi3';
import HaxxorBunnyCommand, {
  BaseApplicationCommandAutocompleteHandler,
  BaseChatInputApplicationCommandHandler,
} from './base';

const CharactersCommand: HaxxorBunnyCommand = {
  data: {
    type: ApplicationCommandType.ChatInput,
    name: 'characters',
    description: 'View information about characters',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'character',
        description: 'Character to get information about',
        autocomplete: true,
        required: false,
      },
    ],
  },
  CommandHandler: class CharactersCommandHandler extends BaseChatInputApplicationCommandHandler {
    public handle(): Promise<void> {
      const args = this.getParsedArguments(
        z.object({
          character: z
            .string()
            .refine((v) => isValidObjectId(v), { message: 'Invalid Character ID' })
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
  CommandAutocompleteHandler: class CharactersCommandAutocompleteHandler extends BaseApplicationCommandAutocompleteHandler {
    public async handle(): Promise<void> {
      const { value } = this.getFocusedOption();
      const characters = await getCharactersByKeyword(value.toString());
      return this.respond({
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: {
          choices: characters.map((c) => ({ name: c.name, value: c._id.toString() })),
        },
      });
    }
  },
};

export default CharactersCommand;
