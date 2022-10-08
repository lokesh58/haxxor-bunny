import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from 'discord-api-types/v10';
import type { NextApiRequest, NextApiResponse } from 'next';
import nacl from 'tweetnacl';

function verifyKey(req: NextApiRequest): boolean {
  const signature = req.headers['x-signature-ed25519'] as string;
  const timestamp = req.headers['x-signature-timestamp'] as string;
  const rawBody = JSON.stringify(req.body);

  if (!signature || !timestamp) {
    return false;
  }

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.DISCORD_APP_PUBLIC_KEY!, 'hex')
  );
}

type ResponseType = string | APIInteractionResponse;

export default async function discordInteractionsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Verify if it is a valid request from discord
  if (!verifyKey(req)) {
    return res.status(401).send('Bad request signature');
  }

  const interaction = req.body as APIInteraction;
  try {
    switch (interaction.type) {
      case InteractionType.Ping:
        return res.send({ type: InteractionResponseType.Pong });
      case InteractionType.ApplicationCommand:
        // TODO: Handle commands properly
        return res.send({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: 'Pong',
          },
        });
      default:
        console.warn(`Received unhandled interaction type: ${interaction.type}`);
        return res.send({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: "😕 This shouldn't be here...",
            flags: MessageFlags.Ephemeral,
          },
        });
    }
  } catch (err) {
    console.error(err);
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: '🐛 Something went wrong, please try again later!',
        flags: MessageFlags.Ephemeral,
      },
    });
  }
}