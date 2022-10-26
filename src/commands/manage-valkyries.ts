import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  MessageFlags,
} from 'discord.js';
import { isValidObjectId, Types } from 'mongoose';
import { z } from 'zod';
import { SingleEmojiRegex, unknownTypeResp } from '../constants/discord';
import { ValkyrieBaseRanks, ValkyrieNatures, ValkyrieNaturesDisplay } from '../constants/hi3';
import { getCharactersByKeyword, getValkyriesByKeyword } from '../utils/hi3';
import HaxxorBunnyCommand, {
  BaseApplicationCommandAutocompleteHandler,
  BaseChatInputApplicationCommandHandler,
} from './base';

const ManageValkyriesCommand: HaxxorBunnyCommand = {
  data: {
    type: ApplicationCommandType.ChatInput,
    name: 'manage-valkyries',
    description: 'Manage Valkyries Data',
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'create',
        description: 'Create a new valkyrie',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'character',
            description: 'Character of the valkyrie',
            autocomplete: true,
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'name',
            description: 'Name of the valkyrie',
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'nature',
            description: 'Nature of the valkyrie',
            choices: ValkyrieNatures.map((n) => ({ name: ValkyrieNaturesDisplay[n].display, value: n })),
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'base-rank',
            description: 'Base rank of the valkyrie',
            choices: ValkyrieBaseRanks.map((r) => ({ name: r.toUpperCase(), value: r })),
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'acronyms',
            description: 'Acronyms of the valkyrie',
            required: false,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'emoji',
            description: 'Emoji for the valkyrie',
            required: false,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'aug-emoji',
            description: 'Augment emoji for the valkyrie',
            required: false,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'update',
        description: 'Update an existing valkyrie',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'valk',
            description: 'Valkyrie to update',
            autocomplete: true,
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'delta-acronyms',
            description: 'Acronyms of the valkyrie',
            required: false,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'emoji',
            description: 'New emoji for the valkyrie',
            required: false,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'aug-emoji',
            description: 'New augment emoji for the valkyrie',
            required: false,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'delete',
        description: 'Delete an existing valkyrie',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'valk',
            description: 'Valkyrie to delete',
            autocomplete: true,
            required: true,
          },
          {
            type: ApplicationCommandOptionType.Boolean,
            name: 'force',
            description: 'Whether to force delete the valkyrie',
            required: false,
          },
        ],
      },
    ],
  },
  ownerOnly: true,
  CommandHandler: class ManageValkyriesCommandHandler extends BaseChatInputApplicationCommandHandler {
    public handle(): Promise<void> {
      const subcommad = this.getSubcommand();
      switch (subcommad?.name) {
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
        z
          .object({
            character: z
              .string()
              .refine((v) => isValidObjectId(v), { message: 'Invalid Character ID' })
              .transform((v) => new Types.ObjectId(v)),
            name: z.string(),
            nature: z.enum(ValkyrieNatures),
            'base-rank': z.enum(ValkyrieBaseRanks),
            acronyms: z.string().optional(),
            emoji: z.string().regex(SingleEmojiRegex, { message: 'Invalid Emoji' }).optional(),
            'aug-emoji': z.string().regex(SingleEmojiRegex, { message: 'Invalid Emoji' }).optional(),
          })
          .transform(({ 'base-rank': baseRank, 'aug-emoji': augEmoji, ...rest }) => ({
            ...(baseRank && { baseRank }),
            ...(augEmoji && { augEmoji }),
            ...rest,
          })),
      );
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: JSON.stringify(args),
        },
      });
    }

    private async update(): Promise<void> {
      const args = this.getParsedArguments(
        z
          .object({
            valk: z
              .string()
              .refine((v) => isValidObjectId(v), { message: 'Invalid Valkyrie ID' })
              .transform((v) => new Types.ObjectId(v)),
            'delta-acronyms': z
              .string()
              .regex(/^\s*(\+|-)\w+(\s*,\s*(\+|-)\w+)*\s*$/i, {
                message: 'Please use `<+/-><acronym> (, ...)` notation',
              })
              .optional(),
            emoji: z.string().regex(SingleEmojiRegex, { message: 'Invalid Emoji' }).optional(),
            'aug-emoji': z.string().regex(SingleEmojiRegex, { message: 'Invalid Emoji' }).optional(),
          })
          .transform(({ 'delta-acronyms': deltaAcronyms, 'aug-emoji': augEmoji, ...rest }) => ({
            ...(deltaAcronyms && { deltaAcronyms }),
            ...(augEmoji && { augEmoji }),
            ...rest,
          })),
      );
      const { valk: valkId, ...updateInfo } = args;
      if (!Object.values(updateInfo).filter(Boolean).length) {
        return this.respond({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: '❓ Nothing to update!',
            flags: MessageFlags.Ephemeral,
          },
        });
      }
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: JSON.stringify(args),
        },
      });
    }

    private async delete(): Promise<void> {
      const args = this.getParsedArguments(
        z.object({
          valk: z
            .string()
            .refine((v) => isValidObjectId(v), { message: 'Invalid Character ID' })
            .transform((v) => new Types.ObjectId(v)),
          force: z.boolean().optional(),
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
  CommandAutocompleteHandler: class ManageValkyriesCommandAutocompleteHandler extends BaseApplicationCommandAutocompleteHandler {
    public async handle(): Promise<void> {
      const { name, value } = this.getFocusedOption();
      const docs = await (name === 'valk'
        ? getValkyriesByKeyword(value.toString())
        : getCharactersByKeyword(value.toString()));
      return this.respond({
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: {
          choices: docs.map((d) => ({ name: d.name, value: d._id.toString() })),
        },
      });
    }
  },
};

export default ManageValkyriesCommand;
