import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  Routes,
} from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  applicationCommandAutocompleteHandler,
  applicationCommandHandler,
  restClient,
  verifyKey,
} from '../../../utils/discord';

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

  const interaction = req.body as APIInteraction;
  try {
    switch (interaction.type) {
      case InteractionType.Ping:
        console.info('Interaction type ping received');
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
      await restClient.post(Routes.webhook(interaction.application_id, interaction.token), {
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
