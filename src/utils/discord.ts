import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteraction,
  APIInteractionResponse,
  REST,
} from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import nacl from 'tweetnacl';

export const restClient = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

export function verifyKey(req: NextApiRequest): boolean {
  const signature = req.headers['x-signature-ed25519'] as string;
  const timestamp = req.headers['x-signature-timestamp'] as string;
  const rawBody = JSON.stringify(req.body);

  if (!signature || !timestamp) {
    return false;
  }

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.DISCORD_APP_PUBLIC_KEY!, 'hex'),
  );
}

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
