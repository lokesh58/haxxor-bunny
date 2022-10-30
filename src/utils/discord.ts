import { CDN, ImageFormat, parseEmoji, REST } from 'discord.js';
import { NextApiRequest } from 'next';
import nacl from 'tweetnacl';

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

export function getEmojiUrl(emoji: string): string | null {
  const parsed = parseEmoji(emoji);
  if (!parsed?.name) return null;
  if (!parsed.id) {
    return `https://twitter.github.io/twemoji/v/13.1.0/72x72/${parsed.name.codePointAt(0)!.toString(16)}.png`;
  }
  return new CDN().emoji(parsed.id, parsed.animated ? ImageFormat.GIF : ImageFormat.PNG);
}
