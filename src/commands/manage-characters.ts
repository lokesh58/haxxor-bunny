import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord.js';
import HaxxorBunnyCommand, { BaseApplicationCommandAutocompleteHandler, BaseApplicationCommandHandler } from './base';

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
  CommandHandler: class ManageCharactersCommandHandler extends BaseApplicationCommandHandler {
    public handle(): Promise<void> {
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '🚧 Work in Progress',
        },
      });
    }
  },
  CommandAutocompleteHandler: class ManageCharactersCommandAutocompleteHandler extends BaseApplicationCommandAutocompleteHandler {
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

export default ManageCharactersCommand;
