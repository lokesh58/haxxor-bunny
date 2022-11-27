import axios from 'axios';
import path from 'path';
import { CDNUrl } from '../constants';
import HaxxorBunnyError from '../error/HaxxorBunnyError';
import type { CDNFileDocument } from '../models/CDNFile';
import CDNFile from '../models/CDNFile';
import { getEmojiUrl } from './discord';

export async function uploadDiscordEmojiToCDN(emoji: string): Promise<void> {
  const emojiUrl = getEmojiUrl(emoji);
  if (!emojiUrl) {
    throw new HaxxorBunnyError('Invalid Emoji');
  }
  const res = await axios.get(emojiUrl, { responseType: 'arraybuffer' });
  await CDNFile.findOneAndUpdate(
    { filename: emoji },
    {
      filename: emoji,
      buffer: Buffer.from(res.data, 'binary'),
      type: res.headers['content-type'],
    },
    { upsert: true },
  );
}

export async function getFile(filename: string): Promise<CDNFileDocument | null> {
  const cdnFile = await CDNFile.findOne({ filename });
  return cdnFile;
}

export function getFileUrl(filename: string): string {
  return path.join(CDNUrl, filename);
  // return new URL(path.join(CDNUrl, filename), getBaseAppUrl()).href;
}
