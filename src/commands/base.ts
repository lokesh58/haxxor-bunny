import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponse,
  ApplicationCommandData,
  RESTGetAPIInteractionOriginalResponseResult,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
  RESTPatchAPIInteractionOriginalResponseResult,
  Routes,
} from 'discord.js';
import { NextApiResponse } from 'next';
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

export abstract class BaseApplicationCommandHandler extends BaseInteractionHandler<
  APIInteractionResponse,
  APIApplicationCommandInteraction
> {
  protected async getOriginalResponse(): Promise<RESTGetAPIInteractionOriginalResponseResult> {
    const resp = await restClient.get(Routes.webhookMessage(this.interaction.application_id, this.interaction.token));
    return resp as RESTGetAPIInteractionOriginalResponseResult;
  }

  protected async editOriginalResponse(
    body: RESTPatchAPIInteractionOriginalResponseJSONBody,
  ): Promise<RESTPatchAPIInteractionOriginalResponseResult> {
    const resp = await restClient.patch(
      Routes.webhookMessage(this.interaction.application_id, this.interaction.token),
      {
        body,
      },
    );
    return resp as RESTPatchAPIInteractionOriginalResponseResult;
  }
}

export abstract class BaseApplicationCommandAutocompleteHandler extends BaseInteractionHandler<
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandAutocompleteInteraction
> {}

type AbstractClassConstructor<T extends abstract new (...args: any) => any> = new (
  ...args: ConstructorParameters<T>
) => InstanceType<T>;

export default interface HaxxorBunnyCommand {
  data: ApplicationCommandData;
  ownerOnly?: boolean;
  examples?: [{ command: string; explanation: string }];
  CommandHandlerClass: AbstractClassConstructor<typeof BaseApplicationCommandHandler>;
  CommandAutocompleteHandlerClass?: AbstractClassConstructor<typeof BaseApplicationCommandAutocompleteHandler>;
}
