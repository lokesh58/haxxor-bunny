import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord.js';
import HaxxorBunnyCommand, { BaseApplicationCommandAutocompleteHandler, BaseApplicationCommandHandler } from './base';

const UserValkyriesCommand: HaxxorBunnyCommand = {
  data: {
    type: ApplicationCommandType.ChatInput,
    name: 'user-valkyries',
    description: 'View valkyries of a user',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'The user whose valkyrie to view',
        required: false,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'user-id',
        description: 'Discord user id of the user',
        required: false,
      },
    ],
  },
  CommandHandler: class UserValkyriesCommandHandler extends BaseApplicationCommandHandler {
    public handle(): Promise<void> {
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '🚧 Work in Progress',
        },
      });
    }
  },
  CommandAutocompleteHandler: class UserValkyriesCommandAutocompleteHandler extends BaseApplicationCommandAutocompleteHandler {
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

export default UserValkyriesCommand;
