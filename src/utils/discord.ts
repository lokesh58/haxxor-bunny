import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  MessageFlags,
  REST,
  Routes,
} from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import nacl from 'tweetnacl';
import commands from '../commands';
import HaxxorBunnyError from '../error/HaxxorBunnyError';
import UnexpectedError from '../error/UnexpectedError';

export const restClient = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

export const BotOwnerIds = process.env.DISCORD_BOT_OWNER_IDS!.split(',');

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
      throw new HaxxorBunnyError(`Unknown command: (${cmdName}, ${cmdId})`);
    }
    const user = interaction.user ?? interaction.member!.user;
    console.info(
      `Executing command (${cmdName}, ${cmdId}) by request of (${user.username}#${user.discriminator}, ${user.id})`,
    );
    await new command.CommandHandlerClass(res, interaction).handle();
  } catch (e) {
    const err = e instanceof HaxxorBunnyError ? e : new UnexpectedError(e);
    console.error(err);
    const respData = {
      content: '🐛 Something went wrong, please try again later!',
      flags: MessageFlags.Ephemeral,
    };
    if (res.writableEnded) {
      restClient
        .post(Routes.webhook(interaction.application_id, interaction.token), { body: respData })
        .catch(console.error);
    } else {
      res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: respData,
      });
    }
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
