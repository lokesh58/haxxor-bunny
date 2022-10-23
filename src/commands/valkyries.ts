import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord.js';
import HaxxorBunnyCommand, { BaseApplicationCommandAutocompleteHandler, BaseApplicationCommandHandler } from './base';

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
  CommandHandler: class ValkyriesCommandHandler extends BaseApplicationCommandHandler {
    public handle(): Promise<void> {
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '🚧 Work in Progress',
        },
      });
    }
  },
  CommandAutocompleteHandler: class ValkyriesCommandAutocompleteHandler extends BaseApplicationCommandAutocompleteHandler {
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

export default ValkyriesCommand;
