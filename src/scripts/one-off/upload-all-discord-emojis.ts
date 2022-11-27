import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { ValkyrieNaturesDisplay } from '../../constants/hi3';
import CDNFile from '../../models/CDNFile';
import Character from '../../models/hi3/Character';
import Valkyrie from '../../models/hi3/Valkyrie';
import { uploadDiscordEmojiToCDN } from '../../utils/cdn';

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.join(__dirname, '../../../.env.local') });
  } else {
    dotenv.config({ path: path.join(__dirname, '../../../.env.production.script.local') });
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
    const chars = await Character.find();
    const valks = await Valkyrie.find();
    const emojis = [
      ...chars.map((c) => c.emoji),
      ...valks.map((v) => v.emoji),
      ...valks.map((v) => v.augEmoji),
      ...Object.values(ValkyrieNaturesDisplay).map((n) => n.emoji),
    ].filter((v: string | undefined): v is string => !!v);
    for (const emoji of emojis) {
      if (!(await CDNFile.exists({ filename: emoji }))) {
        console.log(`Uploading Emoji ${emoji} to DB`);
        await uploadDiscordEmojiToCDN(emoji);
        console.log('Upload complete!');
      }
    }
  } finally {
    await mongoose.connection.close();
  }
}

main();
