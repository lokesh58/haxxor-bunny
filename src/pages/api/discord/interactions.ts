import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import type { NextApiRequest, NextApiResponse } from 'next';

function convertHeader(headerValue: string | string[] | undefined): string {
  return (Array.isArray(headerValue) ? headerValue[0] : headerValue) ?? '';
}

export default async function discordInteractionsHandler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Verify if it is a valid request from discord
  const signature = convertHeader(req.headers['x-signature-ed25519']);
  const timestamp = convertHeader(req.headers['x-signature-timestamp']);
  const isValidRequest = verifyKey(JSON.stringify(req.body), signature, timestamp, process.env.DISCORD_APP_PUBLIC_KEY!);
  if (!isValidRequest) {
    return res.status(401).send('Bad request signature');
  }

  const { type, data } = req.body;

  // Handle verification requests
  if (type === InteractionType.PING) {
    return res.json({ type: InteractionResponseType.PONG });
  }

  // Handle slash commands
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    if (name === 'ping') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Pong',
        },
      });
    }
  }
}
