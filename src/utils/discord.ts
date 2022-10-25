import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIChatInputApplicationCommandInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  MessageFlags,
  REST,
  Routes,
} from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import nacl from 'tweetnacl';
import commands from '../commands';
import { BotName } from '../constants';
import HaxxorBunnyError from '../error/HaxxorBunnyError';
import UnexpectedError from '../error/UnexpectedError';

export const restClient = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

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

export async function chatInputApplicationCommandHandler(
  res: NextApiResponse<APIInteractionResponse>,
  interaction: APIChatInputApplicationCommandInteraction,
): Promise<void> {
  try {
    const {
      data: { name: cmdName, id: cmdId },
    } = interaction;
    const command = commands[cmdName];
    if (!command) {
      throw new HaxxorBunnyError(`Unknown command (${cmdName}, ${cmdId})`);
    }
    const user = interaction.user ?? interaction.member!.user;
    if (command.ownerOnly) {
      const botOwners = process.env.DISCORD_BOT_OWNER_IDS!.split(',');
      if (!botOwners.includes(user.id)) {
        console.warn(
          `User (${user.username}#${user.discriminator}, ${user.id}) tried using owner only command (${cmdName}, ${cmdId})`,
        );
        throw new HaxxorBunnyError(`⛔ You need to be a ${BotName} admin to use this command`, {
          userDisplayable: true,
        });
      }
    }
    console.info(
      `Executing command (${cmdName}, ${cmdId}) by request of (${user.username}#${user.discriminator}, ${user.id})`,
    );
    await new command.CommandHandler(res, interaction).handle();
  } catch (e) {
    const err = e instanceof HaxxorBunnyError ? e : new UnexpectedError(e);
    console.error(err);
    const respData = {
      content: err.userDisplayable ? err.message : '🐛 Something went wrong, please try again later!',
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
  try {
    const {
      data: { name: cmdName, id: cmdId },
    } = interaction;
    const command = commands[cmdName];
    if (!command) {
      throw new HaxxorBunnyError(`Unknown command (${cmdName}, ${cmdId})`);
    }
    if (!command.CommandAutocompleteHandler) {
      throw new HaxxorBunnyError(`Autocomplete not supported for command (${cmdName}, ${cmdId})`);
    }
    const user = interaction.user ?? interaction.member!.user;
    console.info(
      `Executing autocomplete for command (${cmdName}, ${cmdId}) by request of (${user.username}#${user.discriminator}, ${user.id})`,
    );
    await new command.CommandAutocompleteHandler(res, interaction).handle();
  } catch (e) {
    const err = e instanceof HaxxorBunnyError ? e : new UnexpectedError(e);
    console.error(err);
  }
}
