import {
  APIApplicationCommandInteractionDataSubcommandOption,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
} from 'discord.js';
import { z } from 'zod';
import { SingleEmojiRegex, unknownTypeResp } from '../utils/discord';
import HaxxorBunnyCommand, {
  BaseApplicationCommandAutocompleteHandler,
  BaseChatInputApplicationCommandHandler,
} from './base';

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
  CommandHandler: class ManageCharactersCommandHandler extends BaseChatInputApplicationCommandHandler {
    public handle(): Promise<void> {
      const subcommand = this.getSubcommand();
      switch (subcommand?.name) {
        case 'create':
          return this.create(subcommand);
        case 'update':
          return this.update(subcommand);
        case 'delete':
          return this.delete(subcommand);
        default:
          return this.respond(unknownTypeResp);
      }
    }

    private async create(subcommand: APIApplicationCommandInteractionDataSubcommandOption): Promise<void> {
      const args = this.parseOptions(
        subcommand.options ?? [],
        z.object({
          name: z.string(),
          emoji: z.optional(z.string().regex(SingleEmojiRegex)),
        }),
      );
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: JSON.stringify(args),
        },
      });
    }

    private async update(subcommand: APIApplicationCommandInteractionDataSubcommandOption): Promise<void> {
      const args = this.parseOptions(
        subcommand.options ?? [],
        z.object({
          character: z.string(),
          emoji: z.optional(z.string().regex(SingleEmojiRegex)),
        }),
      );
      return this.respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: JSON.stringify(args),
        },
      });
    }

    private async delete(subcommand: APIApplicationCommandInteractionDataSubcommandOption): Promise<void> {
      const args = this.parseOptions(
        subcommand.options ?? [],
        z.object({
          character: z.string(),
          force: z.optional(z.boolean()),
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
