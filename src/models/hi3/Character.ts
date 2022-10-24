import { Model, model, models, Schema } from 'mongoose';

export interface ICharacter {
  name: string;
  emoji?: boolean;
}

const charSchema = new Schema<ICharacter>({
  name: {
    type: String,
    required: true,
    index: true,
  },
  emoji: {
    type: String,
    required: false,
  },
});

export const name = 'hi3-character';
export const collection = 'hi3-characters';
const Character: Model<ICharacter> = models[name] || model(name, charSchema, collection);

export default Character;
