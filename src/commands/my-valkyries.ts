import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  MessageFlags,
} from 'discord.js';
import { isValidObjectId, Types } from 'mongoose';
import { z } from 'zod';
import { unknownTypeResp } from '../constants/discord';
import { AugmentCoreRanks, ValkyrieRanks } from '../constants/hi3';
import { getValkyriesByKeyword, isValidAugmentCoreRank } from '../utils/hi3';
import HaxxorBunnyCommand, {
  BaseApplicationCommandAutocompleteHandler,
  BaseChatInputApplicationCommandHandler,
} from './base';

const MyValkyriesCommand: HaxxorBunnyCommand = {
  data: {
    type: ApplicationCommandType.ChatInput,
    name: 'my-valkyries',
    description: 'View/manage your valkyries',
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'view',
        description: 'View all your valkyries',
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'update',
        description: 'Update your valkyries data',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'valk',
            description: 'The concerned valkyrie for data update',
            autocomplete: true,
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'rank',
            description: 'The rank for chosen valkyrie',
            choices: ValkyrieRanks.map((r) => ({ name: r.toUpperCase(), value: r })),
            required: false,
          },
          {
            type: ApplicationCommandOptionType.Integer,
            name: 'aug-rank',
            description: 'The augment core rank for chosen valkyrie',
            choices: AugmentCoreRanks.map((r) => ({ name: `${r}`, value: r })),
            required: false,
          },
          {
            type: ApplicationCommandOptionType.Boolean,
            name: 'remove',
            description: 'Whether to delete the data for chosen valkyrie',
            required: false,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'add-many',
        description: 'Add data about multiple valkyries together',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'valks',
            description: '<valk> <rank/aug rank> (, ...)',
            required: true,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'delete-many',
        description: 'Delete data about multiple valkyries together',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'valks',
            description: '<valk> (, ...)',
            required: true,
          },
        ],
      },
    ],
  },
  CommandHandler: class MyValkyriesCommandHandler extends BaseChatInputApplicationCommandHandler {
    public handle(): Promise<void> {
      const subcommad = this.getSubcommand();
      switch (subcommad?.name) {
        case 'view':
          return this.view();
        case 'update':
          return this.update();
        case 'add-many':
          return this.addMany();
        case 'delete-many':
          return this.deleteMany();
        default:
          return this.respond(unknownTypeResp);
      }
    }

    private async view(): Promise<void> {
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '🚧 Work in Progress',
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
            rank: z.enum(ValkyrieRanks).optional(),
            'aug-rank': z.number().refine(isValidAugmentCoreRank, { message: 'Invalid Augment Core Rank' }).optional(),
            remove: z.boolean().optional(),
          })
          .transform(({ 'aug-rank': augRank, ...rest }) => ({ ...(augRank && { augRank }), ...rest })),
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

    private async addMany(): Promise<void> {
      const possibleRankAugRanks = [...ValkyrieRanks, ...AugmentCoreRanks].join('|');
      const args = this.getParsedArguments(
        z.object({
          valks: z
            .string()
            .regex(
              new RegExp(
                `^((\s*\w)+\s+(${possibleRankAugRanks}))(\s*,(\s*\w)+\s+(${possibleRankAugRanks}))*\s*$`,
                'ig',
              ),
              {
                message: 'Please use `<valk> <rank/aug rank> (, ...)` notation',
              },
            ),
        }),
      );
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: JSON.stringify(args),
        },
      });
    }

    private async deleteMany(): Promise<void> {
      const args = this.getParsedArguments(
        z.object({
          valks: z
            .string()
            .regex(/^(\s*\w)+(\s*,(\s*\w)+)*\s*$/gi, { message: 'Please use `<valk> (, ...)` notation' }),
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
  CommandAutocompleteHandler: class MyValkyriesCommandAutocompleteHandler extends BaseApplicationCommandAutocompleteHandler {
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

export default MyValkyriesCommand;
