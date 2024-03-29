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
import { PossibleAugmentBaseRanks, ValkyrieBaseRanks, ValkyrieNatures, ValkyrieNaturesDisplay } from '../constants/hi3';
import Character from '../models/hi3/Character';
import Valkyrie from '../models/hi3/Valkyrie';
import { uploadDiscordEmojiToCDN } from '../utils/cdn';
import {
  canValkyrieHaveAugment,
  deleteValkyrie,
  forceDeleteValkyrie,
  getCharactersByKeyword,
  getValkyriesByKeyword,
  isValidAugmentBaseRank,
  ValkyrieDisplayEmbed,
} from '../utils/hi3';
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
            required: true,
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
            acronyms: z
              .string()
              .regex(/^\s*\w+(\s*,\s*\w+)*\s*$/, { message: 'Please use `<acronym> (, ...)` notation' })
              .transform((v) => v.trim().split(/\s*,\s*/)),
            emoji: z.string().regex(SingleEmojiRegex, { message: 'Invalid Emoji' }).optional(),
            'aug-emoji': z.string().regex(SingleEmojiRegex, { message: 'Invalid Emoji' }).optional(),
          })
          .transform(({ 'base-rank': baseRank, 'aug-emoji': augEmoji, ...rest }) => ({
            ...(baseRank && { baseRank }),
            ...(augEmoji && { augEmoji }),
            ...rest,
          })),
      );
      const { name, acronyms, emoji, augEmoji, baseRank, character } = args;
      if (!isValidAugmentBaseRank(baseRank) && augEmoji) {
        return this.respond({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: `❌ Valkyrie which doesn't have base rank as one of \`${PossibleAugmentBaseRanks.map((r) =>
              r.toUpperCase(),
            ).join('`, `')}\` cannot have an augment`,
            flags: MessageFlags.Ephemeral,
          },
        });
      }
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const char = await Character.findById(character);
      if (!char) {
        await this.editOriginalResponse({
          embeds: [
            {
              title: 'Create Valkyrie',
              description: "❌ Given character doesn't exist",
              color: Colors.Red,
            },
          ],
        });
        return;
      }
      if (await Valkyrie.exists({ $or: [{ name }, { acronyms: new RegExp(`^(${acronyms.join('|')})$`, 'i') }] })) {
        await this.editOriginalResponse({
          embeds: [
            {
              title: 'Create Valkyrie',
              description: `❌ Valkyrie with name **${name}** or acronym as${
                acronyms.length > 1 ? ' atleast one of' : ''
              } \`${acronyms.join('`, `')}\` already exists`,
              color: Colors.Red,
            },
          ],
        });
        return;
      }
      if (emoji) await uploadDiscordEmojiToCDN(emoji);
      if (augEmoji) await uploadDiscordEmojiToCDN(augEmoji);
      const valk = await new Valkyrie(args).save();
      await this.editOriginalResponse({
        embeds: [
          ValkyrieDisplayEmbed(valk, char, {
            title: 'Create Valkyrie',
            description: `✅ Valkyrie **${name}** created successfully`,
            color: Colors.Green,
          }),
        ],
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
              .regex(/^\s*(\+|-)\w+(\s*,\s*(\+|-)\w+)*\s*$/, {
                message: 'Please use `<+/-><acronym> (, ...)` notation',
              })
              .transform((v) =>
                v.split(/\s*,\s*/).reduce(
                  (acc, da) => {
                    if (da.startsWith('+')) {
                      return { ...acc, add: [...acc.add, da.substring(1)] };
                    }
                    return { ...acc, remove: [...acc.remove, da.substring(1)] };
                  },
                  { add: [], remove: [] } as { add: string[]; remove: string[] },
                ),
              )
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
      const { deltaAcronyms, emoji, augEmoji } = updateInfo;
      if (!Object.values(updateInfo).filter(Boolean).length) {
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
      const valk = await Valkyrie.findById(valkId);
      if (!valk) {
        await this.editOriginalResponse({
          embeds: [
            {
              title: 'Update Valkyrie',
              description: "❌ Given valkyrie doesn't exist",
              color: Colors.Red,
            },
          ],
        });
        return;
      }
      const canHaveAug = canValkyrieHaveAugment(valk);
      if (!canHaveAug && augEmoji) {
        await this.editOriginalResponse({
          embeds: [
            {
              title: 'Update Valkyrie',
              description: `❌ Valkyrie which doesn't have base rank as one of \`${PossibleAugmentBaseRanks.map((r) =>
                r.toUpperCase(),
              ).join('`, `')}\` cannot have an augment`,
              color: Colors.Red,
            },
          ],
        });
        return;
      }
      if (deltaAcronyms) {
        const acronymSet = new Set(valk.acronyms.map((a) => a.toLowerCase()));
        const newAddedSet = new Set<string>();
        deltaAcronyms.add.forEach((a) => {
          if (!acronymSet.has(a.toLowerCase())) {
            newAddedSet.add(a);
            valk.acronyms.push(a);
            acronymSet.add(a.toLowerCase());
          }
        });
        const removeSet = new Set(deltaAcronyms.remove.map((a) => a.toLowerCase()));
        valk.acronyms = valk.acronyms.filter((va) => !removeSet.has(va.toLowerCase()));
        const newAdded = [...newAddedSet].filter((a) => !removeSet.has(a.toLowerCase()));
        if (
          newAdded.length > 0 &&
          (await Valkyrie.exists({
            _id: { $ne: valk._id },
            acronyms: new RegExp(`^(${valk.acronyms.join('|')})$`, 'i'),
          }))
        ) {
          await this.editOriginalResponse({
            embeds: [
              {
                title: 'Update Valkyrie',
                description: `❌ Valkyrie with acronym as${
                  newAdded.length > 1 ? ' atleast one of' : ''
                } \`${newAdded.join('`, `')}\` already exists`,
                color: Colors.Red,
              },
            ],
          });
          return;
        }
      }
      if (emoji) {
        await uploadDiscordEmojiToCDN(emoji);
        valk.emoji = emoji;
      }
      if (canHaveAug && augEmoji) {
        await uploadDiscordEmojiToCDN(augEmoji);
        valk.augEmoji = augEmoji;
      }
      await valk.save();
      const char = (await Character.findById(valk.character))!;
      await this.editOriginalResponse({
        embeds: [
          ValkyrieDisplayEmbed(valk, char, {
            title: 'Update Valkyrie',
            description: `✅ Valkyrie **${valk.name}** updated successfully`,
            color: Colors.Green,
          }),
        ],
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
      const { valk: valkId, force = false } = args;
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const deleteRes = await (force ? forceDeleteValkyrie(valkId) : deleteValkyrie(valkId));
      await this.editOriginalResponse({
        embeds: [
          {
            title: 'Delete Valkyrie',
            description: deleteRes
              ? `✅ Valkyrie **${deleteRes.name}** deleted successfully`
              : deleteRes === null
              ? "❌ The given Valkyrie doesn't exist"
              : '⚠️ User valkyries data found for this valkyrie, aborting delete. Use `force: true` to delete the valkyrie along with the user valkyries data',
            color: deleteRes ? Colors.Green : deleteRes === null ? Colors.Red : Colors.Yellow,
          },
        ],
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
