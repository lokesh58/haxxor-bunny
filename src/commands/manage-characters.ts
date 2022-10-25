import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Colors,
  InteractionResponseType,
  MessageFlags,
} from 'discord.js';
import { isValidObjectId, Types } from 'mongoose';
import { z } from 'zod';
import { SingleEmojiRegex, unknownTypeResp } from '../constants/discord';
import Character from '../models/hi3/Character';
import { deleteCharacter, forceDeleteCharacter } from '../utils/hi3';
import HaxxorBunnyCommand, {
  BaseApplicationCommandAutocompleteHandler,
  BaseChatInputApplicationCommandHandler,
} from './base';

const ManageCharactersCommand: HaxxorBunnyCommand = {
  data: {
    type: ApplicationCommandType.ChatInput,
    name: 'manage-characters',
    description: 'Manage characters data',
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'create',
        description: 'Create a new character',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'name',
            description: 'Name of the character',
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'emoji',
            description: 'Emoji for the character',
            required: false,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'update',
        description: 'Update an existing character',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'character',
            description: 'Character to update',
            autocomplete: true,
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'emoji',
            description: 'New emoji for the character',
            required: false,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'delete',
        description: 'Delete an existing character',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'character',
            description: 'Character to delete',
            autocomplete: true,
            required: true,
          },
          {
            type: ApplicationCommandOptionType.Boolean,
            name: 'force',
            description: 'Whether to force delete the character',
            required: false,
          },
        ],
      },
    ],
  },
  ownerOnly: true,
  CommandHandler: class ManageCharactersCommandHandler extends BaseChatInputApplicationCommandHandler {
    public handle(): Promise<void> {
      const subcommand = this.getSubcommand();
      switch (subcommand?.name) {
        case 'create':
          return this.create();
        case 'update':
          return this.update();
        case 'delete':
          return this.delete();
        default:
          return this.respond(unknownTypeResp);
      }
    }

    private async create(): Promise<void> {
      const args = this.getParsedArguments(
        z.object({
          name: z.string(),
          emoji: z.string().regex(SingleEmojiRegex, { message: 'Invalid Emoji' }).optional(),
        }),
      );
      const { name } = args;
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      if (await Character.exists({ name: { $regex: new RegExp(`^${name}$`, 'i') } })) {
        await this.editOriginalResponse({
          embeds: [
            {
              title: 'Create Character',
              description: `❌ Character \`${name}\` already exists`,
              color: Colors.Red,
            },
          ],
        });
        return;
      }
      await new Character(args).save();
      await this.editOriginalResponse({
        embeds: [
          {
            title: 'Create Character',
            description: `✅ Character \`${name}\` created successfully`,
            color: Colors.Green,
          },
        ],
      });
    }

    private async update(): Promise<void> {
      const args = this.getParsedArguments(
        z.object({
          character: z
            .string()
            .refine((v) => isValidObjectId(v), { message: 'Invalid Character ID' })
            .transform((v) => new Types.ObjectId(v)),
          emoji: z.string().regex(SingleEmojiRegex, { message: 'Invalid Emoji' }).optional(),
        }),
      );
      const { character: charId, ...updateInfo } = args;
      if (!Object.keys(updateInfo).length) {
        return this.respond({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: '❓ Nothing to update!',
            flags: MessageFlags.Ephemeral,
          },
        });
      }
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const updatedChar = await Character.findByIdAndUpdate(charId, updateInfo);
      await this.editOriginalResponse({
        embeds: [
          {
            title: 'Update Character',
            description: updatedChar
              ? `✅ Character \`${updatedChar.name}\` updated successfully`
              : "❌ The given character doesn't exist",
            color: updatedChar ? Colors.Green : Colors.Red,
          },
        ],
      });
    }

    private async delete(): Promise<void> {
      const args = this.getParsedArguments(
        z.object({
          character: z
            .string()
            .refine((v) => isValidObjectId(v), { message: 'Invalid Character ID' })
            .transform((v) => new Types.ObjectId(v)),
          force: z.boolean().optional(),
        }),
      );
      const { character: charId, force = false } = args;
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const deleteRes = await (force ? forceDeleteCharacter(charId) : deleteCharacter(charId));
      await this.editOriginalResponse({
        embeds: [
          {
            title: 'Delete Character',
            description: deleteRes
              ? `✅ Character \`${deleteRes.name}\` deleted successfully`
              : deleteRes === null
              ? "❌ The given character doesn't exist"
              : '⚠️ Valkyries found for this character, aborting delete. Use `force: true` to delete the character along with the valkyries',
            color: deleteRes ? Colors.Green : deleteRes === null ? Colors.Red : Colors.Yellow,
          },
        ],
      });
    }
  },
  CommandAutocompleteHandler: class ManageCharactersCommandAutocompleteHandler extends BaseApplicationCommandAutocompleteHandler {
    public async handle(): Promise<void> {
      const { value } = this.getFocusedOption();
      const characters = await Character.find({ name: { $regex: new RegExp(value.toString(), 'i') } }).limit(25);
      return this.respond({
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: {
          choices: characters.map((c) => ({ name: c.name, value: c._id.toString() })),
        },
      });
    }
  },
};

export default ManageCharactersCommand;
