import {
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponse,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
} from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import { unknownTypeResp } from '../../../constants/discord';
import { applicationCommandAutocompleteHandler, chatInputApplicationCommandHandler } from '../../../utils/bot';
import dbConnect from '../../../utils/dbConnect';
import { verifyKey } from '../../../utils/discord';

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

  await dbConnect();
  const interaction = req.body as APIInteraction;
  switch (interaction.type) {
    case InteractionType.Ping:
      console.info('Interaction type ping received');
      return res.send({ type: InteractionResponseType.Pong });
    case InteractionType.ApplicationCommand:
      switch (interaction.data.type) {
        case ApplicationCommandType.ChatInput:
          return chatInputApplicationCommandHandler(res, interaction as APIChatInputApplicationCommandInteraction);
        default:
          return res.send(unknownTypeResp);
      }
    case InteractionType.ApplicationCommandAutocomplete:
      return applicationCommandAutocompleteHandler(res, interaction);
    default:
      console.warn(`Received unhandled interaction type: ${interaction.type}`);
      return res.send(unknownTypeResp);
  }
}
