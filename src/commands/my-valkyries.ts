import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord.js';
import { AugmentCoreRanks, ValkyrieRanks } from '../utils/hi3';
import HaxxorBunnyCommand, { BaseApplicationCommandAutocompleteHandler, BaseApplicationCommandHandler } from './base';

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
            type: ApplicationCommandOptionType.Number,
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
  CommandHandler: class MyValkyriesCommandHandler extends BaseApplicationCommandHandler {
    public handle(): Promise<void> {
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '🚧 Work in Progress',
        },
      });
    }
  },
  CommandAutocompleteHandler: class MyValkyriesCommandAutocompleteHandler extends BaseApplicationCommandAutocompleteHandler {
    public handle(): Promise<void> {
      return this.respond({
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: {
          choices: [{ name: 'Work in Progress', value: 'wip' }],
        },
      });
    }
  },
};

export default MyValkyriesCommand;
