import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteraction,
  APIInteractionResponse,
  REST,
} from 'discord.js';
import { NextApiResponse } from 'next';

export const restClient = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

export async function applicationCommandHandler(
  res: NextApiResponse<APIInteractionResponse>,
  interaction: APIApplicationCommandInteraction,
): Promise<void> {
  // TODO: Pick the command and use it's handler
  res.send({
    type: 4,
    data: {
      content: 'Pong',
    },
  });
}

export async function applicationCommandAutocompleteHandler(
  res: NextApiResponse<APIApplicationCommandAutocompleteResponse>,
  interaction: APIApplicationCommandAutocompleteInteraction,
): Promise<void> {
  // TODO: Pick the command and use it's handler
  res.send({
    type: 8,
    data: {
      choices: [
        {
          name: 'Test',
          value: 'test',
        },
      ],
    },
  });
}
