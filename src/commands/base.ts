import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponse,
  APIMessage,
  ApplicationCommandData,
  RESTPatchAPIInteractionOriginalResponseFormDataBody,
  Routes,
} from 'discord.js';
import { NextApiResponse } from 'next';
import { restClient } from '../utils/discord';

abstract class BaseHandler<R extends APIInteractionResponse, I extends APIInteraction> {
  res: NextApiResponse<R>;
  interaction: I;

  constructor(res: NextApiResponse<R>, interaction: I) {
    this.res = res;
    this.interaction = interaction;
  }

  public abstract handle(): Promise<void>;

  protected async sendResponse(body: R): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Request took too long to complete')), 60_000);
      this.res.once('finish', () => {
        clearTimeout(timeout);
        resolve();
      });
      this.res.send(body);
    });
  }
}

export abstract class BaseApplicationCommandHandler extends BaseHandler<
  APIInteractionResponse,
  APIApplicationCommandInteraction
> {
  protected getOriginalResponse(): Promise<APIMessage> {
    return restClient.get(
      Routes.webhookMessage(this.interaction.application_id, this.interaction.token),
    ) as Promise<APIMessage>;
  }

  protected editOriginalResponse(body: RESTPatchAPIInteractionOriginalResponseFormDataBody): Promise<APIMessage> {
    return restClient.patch(Routes.webhookMessage(this.interaction.application_id, this.interaction.token), {
      body,
    }) as Promise<APIMessage>;
  }
}

export abstract class BaseApplicationCommandAutocompleteHandler extends BaseHandler<
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandAutocompleteInteraction
> {}

type AbstractClassConstructor<T extends abstract new (...args: any) => any> = new (
  ...args: ConstructorParameters<T>
) => InstanceType<T>;

export default interface HaxxorBunnyCommand {
  data: ApplicationCommandData;
  examples?: [{ command: string; explanation: string }];
  CommandHandlerClass: AbstractClassConstructor<typeof BaseApplicationCommandHandler>;
  CommandAutocompleteHandlerClass?: AbstractClassConstructor<typeof BaseApplicationCommandAutocompleteHandler>;
}
