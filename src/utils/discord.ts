import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  MessageFlags,
} from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import nacl from 'tweetnacl';
import commands from '../commands';

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
  try {
    const {
      data: { name: cmdName, id: cmdId },
    } = interaction;
    const command = commands[cmdName];
    if (!command) {
      throw new Error(`Unknown command: (${cmdName}, ${cmdId})`);
    }
    await new command.CommandHandlerClass(res, interaction).handle();
  } catch (err) {
    console.error(err);
    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: '🐛 Something went wrong, please try again later!',
        flags: MessageFlags.Ephemeral,
      },
    });
  }
}

export async function applicationCommandAutocompleteHandler(
  res: NextApiResponse<APIApplicationCommandAutocompleteResponse>,
  interaction: APIApplicationCommandAutocompleteInteraction,
): Promise<void> {
  // TODO: Pick the command and use it's handler
  res.send({
    type: InteractionResponseType.ApplicationCommandAutocompleteResult,
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
