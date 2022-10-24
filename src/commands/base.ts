import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteractionDataBasicOption,
  APIApplicationCommandInteractionDataIntegerOption,
  APIApplicationCommandInteractionDataNumberOption,
  APIApplicationCommandInteractionDataOption,
  APIApplicationCommandInteractionDataStringOption,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponse,
  ApplicationCommandData,
  ApplicationCommandOptionType,
  RESTGetAPIInteractionOriginalResponseResult,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
  RESTPatchAPIInteractionOriginalResponseResult,
  Routes,
} from 'discord.js';
import { NextApiResponse } from 'next';
import { ZodError, ZodObject, ZodRawShape } from 'zod';
import HaxxorBunnyError from '../error/HaxxorBunnyError';
import { restClient } from '../utils/discord';

enum InteractionResponseStatus {
  Pending,
  Sending,
  Sent,
  Errored,
}

abstract class BaseInteractionHandler<R extends APIInteractionResponse, I extends APIInteraction> {
  private res: NextApiResponse<R>;
  protected interaction: I;
  private responseStatus: InteractionResponseStatus;

  constructor(res: NextApiResponse<R>, interaction: I) {
    this.res = res;
    this.interaction = interaction;
    this.responseStatus = InteractionResponseStatus.Pending;
  }

  protected get responded(): boolean {
    return this.responseStatus === InteractionResponseStatus.Sent;
  }

  public abstract handle(): Promise<void>;

  protected async respond(body: R): Promise<void> {
    if (this.responseStatus !== InteractionResponseStatus.Pending) {
      return Promise.reject(new HaxxorBunnyError('Interaction already responded'));
    }
    return new Promise((resolve, reject) => {
      this.res
        .once('close', () => {
          this.responseStatus = InteractionResponseStatus.Sent;
          resolve();
        })
        .once('error', (err) => {
          this.responseStatus = InteractionResponseStatus.Errored;
          reject(err);
        })
        .send(body);
    });
  }
}

type APIApplicationCommandInteractionDataAutocompleteSupportedOption =
  | APIApplicationCommandInteractionDataStringOption
  | APIApplicationCommandInteractionDataIntegerOption
  | APIApplicationCommandInteractionDataNumberOption;

class SlashCommandDataOptionUtils {
  public static isSubcommandOption(
    o: APIApplicationCommandInteractionDataOption,
  ): o is APIApplicationCommandInteractionDataSubcommandOption {
    return o.type === ApplicationCommandOptionType.Subcommand;
  }

  public static isBasicOption(
    o: APIApplicationCommandInteractionDataOption,
  ): o is APIApplicationCommandInteractionDataBasicOption {
    return ![ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(o.type);
  }

  public static isPossibleAutocompleteOption(
    o: APIApplicationCommandInteractionDataOption,
  ): o is APIApplicationCommandInteractionDataAutocompleteSupportedOption {
    return [
      ApplicationCommandOptionType.String,
      ApplicationCommandOptionType.Integer,
      ApplicationCommandOptionType.Number,
    ].includes(o.type);
  }

  public static isFocused(
    o: APIApplicationCommandInteractionDataOption,
  ): o is APIApplicationCommandInteractionDataAutocompleteSupportedOption & { focused: true } {
    return SlashCommandDataOptionUtils.isPossibleAutocompleteOption(o) && !!o.focused;
  }

  public static parseOptions<T extends ZodRawShape>(
    rawOptions: APIApplicationCommandInteractionDataOption[],
    parser: ZodObject<T>,
  ): ReturnType<ZodObject<T>['parse']> {
    const rawBasicOptions = rawOptions.filter(SlashCommandDataOptionUtils.isBasicOption);
    try {
      return parser.parse(rawBasicOptions.reduce((oo, o) => ({ ...oo, [o.name]: o.value }), {}));
    } catch (err) {
      if (err instanceof ZodError) {
        const invalidArgs = [...new Set(err.errors.map((e) => e.path).reduce((s, o) => [...s, ...o], [])).values()];
        throw new HaxxorBunnyError(`❌ Invalid value for argument(s): \`${invalidArgs.join('`, `')}\``, {
          userDisplayable: true,
        });
      }
      throw err;
    }
  }
}

abstract class BaseSlashCommandHandler<
  R extends APIInteractionResponse,
  I extends APIChatInputApplicationCommandInteraction | APIApplicationCommandAutocompleteInteraction,
> extends BaseInteractionHandler<R, I> {
  protected getSubcommand(): APIApplicationCommandInteractionDataSubcommandOption | undefined {
    return this.interaction.data.options?.find(SlashCommandDataOptionUtils.isSubcommandOption);
  }
}

export abstract class BaseChatInputApplicationCommandHandler extends BaseSlashCommandHandler<
  APIInteractionResponse,
  APIChatInputApplicationCommandInteraction
> {
  protected getParsedArguments<T extends ZodRawShape>(parser: ZodObject<T>): ReturnType<ZodObject<T>['parse']> {
    const subcommand = this.getSubcommand();
    const options = subcommand?.options ?? this.interaction.data.options ?? [];
    return SlashCommandDataOptionUtils.parseOptions(options, parser);
  }

  protected async getOriginalResponse(): Promise<RESTGetAPIInteractionOriginalResponseResult> {
    if (!this.responded) {
      throw new HaxxorBunnyError('Interaction not responded');
    }
    const resp = await restClient.get(Routes.webhookMessage(this.interaction.application_id, this.interaction.token));
    return resp as RESTGetAPIInteractionOriginalResponseResult;
  }

  protected async editOriginalResponse(
    body: RESTPatchAPIInteractionOriginalResponseJSONBody,
  ): Promise<RESTPatchAPIInteractionOriginalResponseResult> {
    if (!this.responded) {
      throw new HaxxorBunnyError('Interaction not responded');
    }
    const resp = await restClient.patch(
      Routes.webhookMessage(this.interaction.application_id, this.interaction.token),
      {
        body,
      },
    );
    return resp as RESTPatchAPIInteractionOriginalResponseResult;
  }
}

export abstract class BaseApplicationCommandAutocompleteHandler extends BaseSlashCommandHandler<
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandAutocompleteInteraction
> {
  protected getFocusedOption() {
    const subcommand = this.getSubcommand();
    const options = subcommand?.options ?? this.interaction.data.options ?? [];
    return options.find(SlashCommandDataOptionUtils.isFocused)!;
  }
}

type Constructor<T extends abstract new (...args: any) => any> = new (
  ...args: ConstructorParameters<T>
) => InstanceType<T>;

export default interface HaxxorBunnyCommand {
  data: ApplicationCommandData;
  ownerOnly?: boolean;
  examples?: [{ command: string; explanation: string }];
  CommandHandler: Constructor<typeof BaseChatInputApplicationCommandHandler>;
  CommandAutocompleteHandler?: Constructor<typeof BaseApplicationCommandAutocompleteHandler>;
}
