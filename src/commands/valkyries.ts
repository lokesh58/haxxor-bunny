import { ApplicationCommandOptionType, ApplicationCommandType, Colors, InteractionResponseType } from 'discord.js';
import { isValidObjectId, Types } from 'mongoose';
import { z } from 'zod';
import { ICharacter } from '../models/hi3/Character';
import Valkyrie from '../models/hi3/Valkyrie';
import {
  convertToDisplayEmbeds,
  getValkyriesByKeyword,
  valkyrieCompare,
  ValkyrieDisplayEmbed,
  ValkyrieListDisplay,
} from '../utils/hi3';
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
      const { valk } = args;
      if (valk) {
        return this.view(valk);
      }
      return this.list();
    }

    private async list(): Promise<void> {
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const valks = await Valkyrie.find();
      valks.sort(valkyrieCompare);
      const embeds = convertToDisplayEmbeds(valks, ValkyrieListDisplay, {
        title: 'Valkyries',
        emptyText: '*No valkyries*',
      });
      for (const embed of embeds) {
        await this.createFollowup({ embeds: [embed] });
      }
    }

    private async view(valkyrieId: Types.ObjectId): Promise<void> {
      await this.respond({
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      });
      const valk = await Valkyrie.findById(valkyrieId).populate<{ character: Pick<ICharacter, 'name'> }>({
        path: 'character',
        select: 'name',
      });
      if (!valk) {
        await this.editOriginalResponse({
          embeds: [
            {
              title: 'View Valkyrie',
              description: "❌ Given valkyrie doesn't exist",
              color: Colors.Red,
            },
          ],
        });
        return;
      }
      await this.editOriginalResponse({
        embeds: [ValkyrieDisplayEmbed(valk, valk.character, { title: 'View Valkyrie' })],
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
