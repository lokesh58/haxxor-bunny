import {
  APIInteraction,
  APIInteractionResponse,
  Awaitable,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import { applicationCommandAutocompleteHandler, applicationCommandHandler, verifyKey } from '../../../utils/discord';

export default function discordInteractionsHandler(
  req: NextApiRequest,
  res: NextApiResponse<string | APIInteractionResponse>,
): Awaitable<void> {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Verify if it is a valid request from discord
  if (!verifyKey(req)) {
    return res.status(401).send('Bad request signature');
  }

  const interaction = req.body as APIInteraction;
  switch (interaction.type) {
    case InteractionType.Ping:
      console.info('Interaction type ping received');
      return res.send({ type: InteractionResponseType.Pong });
    case InteractionType.ApplicationCommand:
      return applicationCommandHandler(res, interaction);
    case InteractionType.ApplicationCommandAutocomplete:
      return applicationCommandAutocompleteHandler(res, interaction);
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
}
