import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord.js';
import { ValkyrieBaseRanks, ValkyrieNatures } from '../utils/hi3';
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
            choices: ValkyrieNatures.map((n) => ({ name: n.display, value: n.value })),
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
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '🚧 Work in Progress',
        },
      });
    }
  },
  CommandAutocompleteHandler: class ManageValkyriesCommandAutocompleteHandler extends BaseApplicationCommandAutocompleteHandler {
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

export default ManageValkyriesCommand;
