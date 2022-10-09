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

enum InteractionResponseStatus {
  Pending,
  InProgress,
  Responded,
  Failed,
}

abstract class BaseHandler<R extends APIInteractionResponse, I extends APIInteraction> {
  private res: NextApiResponse<R>;
  protected interaction: I;
  private _responseStatus: InteractionResponseStatus;

  constructor(res: NextApiResponse<R>, interaction: I) {
    this.res = res;
    this.interaction = interaction;
    this._responseStatus = InteractionResponseStatus.Pending;
  }

  public get responded(): boolean {
    return this._responseStatus === InteractionResponseStatus.Responded;
  }

  public abstract handle(): Promise<void>;

  protected async sendResponse(body: R): Promise<void> {
    if (this._responseStatus !== InteractionResponseStatus.Pending) {
      throw new Error('Already responded to the interaction');
    }
    this._responseStatus = InteractionResponseStatus.InProgress;
    return new Promise((resolve, reject) => {
      this.res
        .once('close', () => {
          if (this._responseStatus !== InteractionResponseStatus.InProgress) return;
          if (this.res.writableFinished) {
            this._responseStatus = InteractionResponseStatus.Responded;
            resolve();
          } else {
            this._responseStatus = InteractionResponseStatus.Failed;
            reject(new Error('Response stream closed before finishing'));
          }
        })
        .once('error', (err) => {
          if (this._responseStatus !== InteractionResponseStatus.InProgress) return;
          this._responseStatus = InteractionResponseStatus.Failed;
          reject(err);
        })
        .send(body);
    });
  }
}

export abstract class BaseApplicationCommandHandler extends BaseHandler<
  APIInteractionResponse,
  APIApplicationCommandInteraction
> {
  private checkResponded(): void {
    if (!this.responded) {
      throw new Error('Respond to the interaction first');
    }
  }

  protected getOriginalResponse(): Promise<APIMessage> {
    this.checkResponded();
    return restClient.get(
      Routes.webhookMessage(this.interaction.application_id, this.interaction.token),
    ) as Promise<APIMessage>;
  }

  protected editOriginalResponse(body: RESTPatchAPIInteractionOriginalResponseFormDataBody): Promise<APIMessage> {
    this.checkResponded();
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
