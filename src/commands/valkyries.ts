import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType } from 'discord.js';
import { getValkyriesByKeyword } from '../utils/hi3';
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
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '🚧 Work in Progress',
        },
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
