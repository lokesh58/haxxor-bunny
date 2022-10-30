import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Colors,
  InteractionResponseType,
  MessageFlags,
} from 'discord.js';
import { isValidObjectId, Types } from 'mongoose';
import { z } from 'zod';
import { unknownTypeResp } from '../constants/discord';
import { AugmentCoreRanks, AugmentCoreRequirements, ValkyrieRanks } from '../constants/hi3';
import UserValkyrie, { UserValkyrieDocument } from '../models/hi3/UserValkyrie';
import Valkyrie, { ValkyrieDocument } from '../models/hi3/Valkyrie';
import {
  canValkyrieHaveAugment,
  getUserValkyrieDisplayEmbeds,
  getValkyriesByKeyword,
  isValidAugmentCoreRank,
} from '../utils/hi3';
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
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const embeds = await getUserValkyrieDisplayEmbeds(this.user.id);
      for (const embed of embeds) {
        await this.createFollowup({ embeds: [embed] });
      }
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
          .transform(({ 'aug-rank': augRank, ...rest }) => ({ ...(augRank && { coreRank: augRank }), ...rest })),
      );
      const { valk: valkId, ...updateInfo } = args;
      const { remove = false, ...newInfo } = updateInfo;
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
              title: 'Update My Valkyries Data',
              description: "❌ Given valkyrie doesn't exist",
              color: Colors.Red,
            },
          ],
        });
        return;
      }
      if (remove) {
        const deletedUserValk = await UserValkyrie.findOneAndDelete({ valkyrie: valkId, userId: this.user.id });
        await this.editOriginalResponse({
          embeds: [
            {
              title: 'Update My Valkyrie Data',
              description: deletedUserValk
                ? `✅ Valkyrie data for **${valk.name}** removed successfully`
                : `❌ Valkyrie data not found for **${valk.name}**`,
              color: deletedUserValk ? Colors.Green : Colors.Red,
            },
          ],
        });
        return;
      }
      let userValk = await UserValkyrie.findOne({ valkyrie: valkId, userId: this.user.id });
      if (!userValk) {
        if (!newInfo.rank) {
          await this.editOriginalResponse({
            embeds: [
              {
                title: 'Update My Valkyries Data',
                description: `❌ Battlesuit rank data neither supplied nor present previously for **${valk.name}**`,
                color: Colors.Red,
              },
            ],
          });
          return;
        }
        userValk = new UserValkyrie({ valkyrie: valkId, userId: this.user.id, ...newInfo });
      } else {
        if (newInfo.rank) userValk.rank = newInfo.rank;
        if (newInfo.coreRank) userValk.coreRank = newInfo.coreRank;
      }
      const validationRes = this.validateUserValkUpdateData(valk, userValk);
      if (!validationRes.valid) {
        await this.editOriginalResponse({
          embeds: [
            {
              title: 'Update My Valkyries Data',
              description: validationRes.message,
              color: Colors.Red,
            },
          ],
        });
        return;
      }
      await userValk.save();
      await this.editOriginalResponse({
        embeds: [
          {
            title: 'Update My Valkyries Data',
            description: `✅ Valkyrie data for **${valk.name}** updated successfully`,
            color: Colors.Green,
          },
        ],
      });
    }

    private validateUserValkUpdateData(
      valk: ValkyrieDocument,
      userValk: UserValkyrieDocument,
    ): { valid: true } | { valid: false; message: string } {
      if (ValkyrieRanks.indexOf(userValk.rank) < ValkyrieRanks.indexOf(valk.baseRank)) {
        return {
          valid: false,
          message: `❌ Battlesuit rank cannot be lower than valkyrie base rank (\`${valk.baseRank.toUpperCase()}\` for **${
            valk.name
          }**)`,
        };
      }
      const hasAug = canValkyrieHaveAugment(valk) && !!valk.augEmoji;
      if (!hasAug && userValk.coreRank) {
        return {
          valid: false,
          message: `❌ Valkyrie **${valk.name}** doesn't have an augment`,
        };
      }
      if (hasAug && userValk.coreRank) {
        const minReqRank = AugmentCoreRequirements[valk.baseRank][userValk.coreRank - 1];
        if (ValkyrieRanks.indexOf(userValk.rank) < ValkyrieRanks.indexOf(minReqRank)) {
          return {
            valid: false,
            message: `❌ Battlesuit rank must be atleast \`${minReqRank.toUpperCase()}\` to have Augment Core Rank \`${
              userValk.coreRank
            }\` for **${valk.name}**`,
          };
        }
      }
      return { valid: true };
    }

    private async addMany(): Promise<void> {
      const possibleRankAugRanks = [...ValkyrieRanks, ...AugmentCoreRanks].join('|');
      const args = this.getParsedArguments(
        z.object({
          valks: z
            .string()
            .max(100, { message: 'Keep the length of input less than 100' })
            .regex(
              new RegExp(
                `^\\s*(\\w+\\s+)+(${possibleRankAugRanks})(\\s*,\\s*(\\w+\\s+)+(${possibleRankAugRanks}))*\\s*$`,
                'i',
              ),
              {
                message: 'Please use `<valk> <rank/aug rank> (, ...)` notation',
              },
            )
            .transform((v) =>
              v
                .trim()
                .split(/\s*,\s*/)
                .map((rawValk) => {
                  const parts = rawValk.split(/\s+/);
                  const rankOrAugRank = parts.pop()!;
                  const nameOrAcronym = parts.join(' ');
                  if (!isNaN(+rankOrAugRank)) {
                    return {
                      nameOrAcronym,
                      coreRank: +rankOrAugRank as typeof AugmentCoreRanks[number],
                    };
                  }
                  return {
                    nameOrAcronym,
                    rank: rankOrAugRank.toLowerCase() as typeof ValkyrieRanks[number],
                  };
                }),
            ),
        }),
      );
      const { valks } = args;
      const valksDataMap = new Map<
        string,
        { rank?: typeof ValkyrieRanks[number]; coreRank?: typeof AugmentCoreRanks[number] }
      >();
      valks.forEach((valkData) => {
        const { nameOrAcronym, ...rest } = valkData;
        valksDataMap.set(nameOrAcronym, { ...valksDataMap.get(nameOrAcronym), ...rest });
      });
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const results: string[] = [];
      const toSave: UserValkyrieDocument[] = [];
      for (const [nameOrAcronym, info] of valksDataMap) {
        const valkRegex = new RegExp(`^${nameOrAcronym}$`, 'i');
        const valk = await Valkyrie.findOne({ $or: [{ name: valkRegex }, { acronyms: valkRegex }] });
        if (!valk) {
          results.push(`❌ Valkyrie **${nameOrAcronym}** doesn't exist`);
          continue;
        }
        let userValk = await UserValkyrie.findOne({ userId: this.user.id, valkyrie: valk._id });
        if (!userValk) {
          if (!info.rank) {
            results.push(`❌ Battlesuit rank data neither supplied nor present previously for **${valk.name}**`);
            continue;
          }
          userValk = new UserValkyrie({ valkyrie: valk._id, userId: this.user.id, ...info });
        } else {
          if (info.rank) userValk.rank = info.rank;
          if (info.coreRank) userValk.coreRank = info.coreRank;
        }
        const validationRes = this.validateUserValkUpdateData(valk, userValk);
        if (!validationRes.valid) {
          results.push(validationRes.message);
          continue;
        }
        toSave.push(userValk);
        results.push(
          `✅ **${valk.name}** ${valk.emoji ?? '-'}${info.rank ? ` \`${info.rank.toUpperCase()}\`` : ''}${
            info.coreRank ? ` ${info.coreRank}⭐` : ''
          }`,
        );
      }
      await UserValkyrie.bulkSave(toSave);
      await this.editOriginalResponse({
        embeds: [
          {
            title: 'Bulk Add My Valkyries Data',
            description: results.join('\n'),
          },
        ],
      });
    }

    private async deleteMany(): Promise<void> {
      const args = this.getParsedArguments(
        z.object({
          valks: z
            .string()
            .max(100, { message: 'Keep the length of input less than 100' })
            .regex(/^\s*(\w+\s+)*\w+(\s*,\s*(\w+\s+)*\w+)*\s*$/, { message: 'Please use `<valk> (, ...)` notation' })
            .transform((v) => v.trim().split(/\s*,\s*/)),
        }),
      );
      const { valks: valkNameOrAcronyms } = args;
      const valkNameOrAcronymsSet = new Set(valkNameOrAcronyms);
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const results: string[] = [];
      const toRemove: Types.ObjectId[] = [];
      for (const nameOrAcronym of valkNameOrAcronymsSet) {
        const valkRegex = new RegExp(`^${nameOrAcronym}$`, 'i');
        const valk = await Valkyrie.findOne({ $or: [{ name: valkRegex }, { acronyms: valkRegex }] });
        if (!valk) {
          results.push(`❌ Valkyrie **${nameOrAcronym}** doesn't exist`);
          continue;
        }
        const userValk = await UserValkyrie.findOne({ userId: this.user.id, valkyrie: valk._id });
        if (!userValk) {
          results.push(`❌ Valkyrie data not found for **${valk.name}**`);
          continue;
        }
        toRemove.push(userValk._id);
        results.push(`✅ Valkyrie data for **${valk.name}** removed successfully`);
      }
      await UserValkyrie.deleteMany({ _id: { $in: toRemove } });
      await this.editOriginalResponse({
        embeds: [
          {
            title: 'Bulk Delete My Valkyries Data',
            description: results.join('\n'),
          },
        ],
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
