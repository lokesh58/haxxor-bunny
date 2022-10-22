import { model, Schema } from 'mongoose';

export interface Character {
  name: string;
  emoji?: boolean;
}

const charSchema = new Schema<Character>({
  name: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    required: false,
  },
});

export const name = 'hi3-character';
export const collection = 'hi3-characters';

export default model(name, charSchema, collection);
