import { InteractionResponseType, MessageFlags } from 'discord.js';

export const unknownTypeResp = {
  type: InteractionResponseType.ChannelMessageWithSource,
  data: {
    content: "😕 This shouldn't be here...",
    flags: MessageFlags.Ephemeral,
  },
} as const;

export const SingleEmojiRegex = /^((<a?:\w+:\d+>)|(\p{Extended_Pictographic}))$/gu;
