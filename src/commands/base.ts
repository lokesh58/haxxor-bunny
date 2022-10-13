import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponse,
  ApplicationCommandData,
  Awaitable,
} from 'discord.js';
import { NextApiResponse } from 'next';

abstract class BaseHandler<R extends APIInteractionResponse, I extends APIInteraction> {
  protected res: NextApiResponse<R>;
  protected interaction: I;

  constructor(res: NextApiResponse<R>, interaction: I) {
    this.res = res;
    this.interaction = interaction;
  }

  public abstract handle(): Awaitable<void>;
}

export abstract class BaseApplicationCommandHandler extends BaseHandler<
  APIInteractionResponse,
  APIApplicationCommandInteraction
> {}

export abstract class BaseApplicationCommandAutocompleteHandler extends BaseHandler<
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
