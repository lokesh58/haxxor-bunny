import { ApplicationCommandOptionType, ApplicationCommandType, Colors, InteractionResponseType } from 'discord.js';
import { isValidObjectId, Types } from 'mongoose';
import { z } from 'zod';
import Character from '../models/hi3/Character';
import Valkyrie from '../models/hi3/Valkyrie';
import { getEmojiUrl } from '../utils/discord';
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
            .transform((v) => new Types.ObjectId(v))
            .optional(),
        }),
      );
      const { character } = args;
      if (character) {
        return this.view(character);
      }
      return this.list();
    }

    private async list(): Promise<void> {
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const chars = await Character.find();
      await this.editOriginalResponse({
        embeds: [
          {
            title: 'Characters',
            description: chars.map((c) => `• \`${c.name}\`${c.emoji ? ` ${c.emoji}` : ''}`).join('\n'),
          },
        ],
      });
    }

    private async view(characterId: Types.ObjectId): Promise<void> {
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const [char, valks] = await Promise.all([
        Character.findById(characterId),
        Valkyrie.find({ character: characterId }),
      ]);
      if (!char) {
        await this.editOriginalResponse({
          embeds: [
            {
              title: 'View Character',
              description: "❌ Given character doesn't exist",
              color: Colors.Red,
            },
          ],
        });
        return;
      }
      const emojiUrl = getEmojiUrl(char.emoji ?? '');
      await this.editOriginalResponse({
        embeds: [
          {
            title: 'View Character',
            description: `${char.name}`,
            ...(emojiUrl && { thumbnail: { url: emojiUrl } }),
            fields: [
              {
                name: 'Valkyries',
                value: valks.length
                  ? valks
                      .map(
                        (v) =>
                          `• \`${v.name}\`${v.emoji ? ` ${v.emoji}` : `${'augEmoji' in v && v.augEmoji ? ' -' : ''}`}${
                            'augEmoji' in v && v.augEmoji ? ` ${v.augEmoji}` : ''
                          }`,
                      )
                      .join('\n')
                  : `*No Valkyries for \`${char.name}\`*`,
              },
            ],
          },
        ],
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
