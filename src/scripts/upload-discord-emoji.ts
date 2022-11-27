import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { uploadDiscordEmojiToCDN } from '../utils/cdn';

async function main() {
  dotenv.config({ path: path.join(__dirname, '../../.env.local') });
  const [, , emoji] = process.argv;
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
    console.log(`Uploading Emoji ${emoji} to DB`);
    await uploadDiscordEmojiToCDN(emoji, { upsert: true });
    console.log('Upload complete!');
  } finally {
    await mongoose.connection.close();
  }
}

main();
