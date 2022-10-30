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
  APIUser,
  ApplicationCommandData,
  ApplicationCommandOptionType,
  RESTGetAPIInteractionOriginalResponseResult,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
  RESTPatchAPIInteractionOriginalResponseResult,
  RESTPostAPIInteractionFollowupJSONBody,
  RESTPostAPIInteractionFollowupResult,
  Routes,
} from 'discord.js';
import { NextApiResponse } from 'next';
import { z, ZodError, ZodTypeAny } from 'zod';
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

  protected get user(): APIUser {
    return this.interaction.user ?? this.interaction.member!.user;
  }
}

type APIApplicationCommandInteractionDataAutocompleteSupportedOption =
  | APIApplicationCommandInteractionDataStringOption
  | APIApplicationCommandInteractionDataIntegerOption
  | APIApplicationCommandInteractionDataNumberOption;

class SlashCommandInteractionDataOptionUtils {
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
    return SlashCommandInteractionDataOptionUtils.isPossibleAutocompleteOption(o) && !!o.focused;
  }

  public static parseOptions<T extends ZodTypeAny>(
    rawOptions: APIApplicationCommandInteractionDataOption[],
    schema: T,
  ): z.infer<T> {
    const rawBasicOptions = rawOptions.filter(SlashCommandInteractionDataOptionUtils.isBasicOption);
    try {
      return schema.parse(rawBasicOptions.reduce((oo, o) => ({ ...oo, [o.name]: o.value }), {}));
    } catch (err) {
      if (err instanceof ZodError) {
        const errSummary = err.errors.map((e) => `• \`${e.path}\`: ${e.message}`).join('\n');
        throw new HaxxorBunnyError(`❌ Invalid value for argument(s):\n${errSummary}`, {
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
    return this.interaction.data.options?.find(SlashCommandInteractionDataOptionUtils.isSubcommandOption);
  }
}

export abstract class BaseChatInputApplicationCommandHandler extends BaseSlashCommandHandler<
  APIInteractionResponse,
  APIChatInputApplicationCommandInteraction
> {
  protected getParsedArguments<T extends ZodTypeAny>(schema: T): z.infer<T> {
    const subcommand = this.getSubcommand();
    const options = subcommand?.options ?? this.interaction.data.options ?? [];
    return SlashCommandInteractionDataOptionUtils.parseOptions(options, schema);
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

  protected async createFollowup(
    body: RESTPostAPIInteractionFollowupJSONBody,
  ): Promise<RESTPostAPIInteractionFollowupResult> {
    if (!this.responded) {
      throw new HaxxorBunnyError('Interaction not responded');
    }
    const resp = await restClient.post(Routes.webhook(this.interaction.application_id, this.interaction.token), {
      body,
    });
    return resp as RESTPostAPIInteractionFollowupResult;
  }
}

export abstract class BaseApplicationCommandAutocompleteHandler extends BaseSlashCommandHandler<
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandAutocompleteInteraction
> {
  protected getFocusedOption() {
    const subcommand = this.getSubcommand();
    const options = subcommand?.options ?? this.interaction.data.options ?? [];
    return options.find(SlashCommandInteractionDataOptionUtils.isFocused)!;
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
