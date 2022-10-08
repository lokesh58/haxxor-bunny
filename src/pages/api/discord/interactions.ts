import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  Routes,
} from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import nacl from 'tweetnacl';
import { applicationCommandAutocompleteHandler, applicationCommandHandler, restClient } from '../../../utils/discord';

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
    Buffer.from(process.env.DISCORD_APP_PUBLIC_KEY!, 'hex'),
  );
}

type ResponseData = string | APIInteractionResponse;

export default async function discordInteractionsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
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
        console.info('Interaction type ping (1) received');
        return res.send({ type: InteractionResponseType.Pong });
      case InteractionType.ApplicationCommand:
        await applicationCommandHandler(res, interaction);
        break;
      case InteractionType.ApplicationCommandAutocomplete:
        await applicationCommandAutocompleteHandler(res, interaction);
        break;
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
    const errorMessageBody = {
      content: '🐛 Something went wrong, please try again later!',
      flags: MessageFlags.Ephemeral,
    };
    if (res.writableEnded) {
      await restClient.post(Routes.webhook(process.env.DISCORD_APP_ID!, interaction.token), {
        body: errorMessageBody,
      });
    } else {
      res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: errorMessageBody,
      });
    }
  }
}
