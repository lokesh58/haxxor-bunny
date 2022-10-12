import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import { applicationCommandAutocompleteHandler, applicationCommandHandler, verifyKey } from '../../../utils/discord';

export default async function discordInteractionsHandler(
  req: NextApiRequest,
  res: NextApiResponse<string | APIInteractionResponse>,
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Verify if it is a valid request from discord
  if (!verifyKey(req)) {
    return res.status(401).send('Bad request signature');
  }

  setTimeout(() => {
    if (!res.writableEnded) {
      res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '🕛 Request timed out, please try again later!',
          flags: MessageFlags.Ephemeral,
        },
      });
    }
  }, 2_000);

  const interaction = req.body as APIInteraction;
  switch (interaction.type) {
    case InteractionType.Ping:
      console.info('Interaction type ping received');
      res.send({ type: InteractionResponseType.Pong });
      break;
    case InteractionType.ApplicationCommand:
      await applicationCommandHandler(res, interaction);
      break;
    case InteractionType.ApplicationCommandAutocomplete:
      await applicationCommandAutocompleteHandler(res, interaction);
      break;
    default:
      console.warn(`Received unhandled interaction type: ${interaction.type}`);
      res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "😕 This shouldn't be here...",
          flags: MessageFlags.Ephemeral,
        },
      });
      break;
  }
}
