import { APIInteraction, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
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

export default async function discordInteractionsHandler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Verify if it is a valid request from discord
  if (!verifyKey(req)) {
    return res.status(401).send('Bad request signature');
  }

  const { type, data } = req.body as APIInteraction;

  // Handle verification requests
  if (type === InteractionType.Ping) {
    return res.json({ type: InteractionResponseType.Pong });
  }

  // Handle slash commands
  if (type === InteractionType.ApplicationCommand) {
    const { name } = data;
    if (name === 'ping') {
      return res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'Pong',
        },
      });
    }
  }
}
