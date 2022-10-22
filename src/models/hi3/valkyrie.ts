import { model, Schema } from 'mongoose';
import { ValkyrieBaseRanks, ValkyrieNatures } from '../../utils/hi3';

export interface Valkyrie {
  character: Schema.Types.ObjectId;
  name: string;
  nature: typeof ValkyrieNatures[number]['value'];
  baseRank: typeof ValkyrieBaseRanks[number];
  acronyms: string[];
  emoji?: string;
  augEmoji?: string;
}

const valkSchema = new Schema<Valkyrie>({
  character: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  nature: {
    type: String,
    enum: ValkyrieNatures.map((n) => n.value),
    required: true,
  },
  baseRank: {
    type: String,
    enum: ValkyrieBaseRanks,
    required: true,
  },
  acronyms: {
    type: [String],
    required: true,
  },
  emoji: {
    type: String,
    required: false,
  },
  augEmoji: {
    type: String,
    required: false,
  },
});

export const name = 'hi3-valkyrie';
export const collection = 'hi3-valkyries';

export default model(name, valkSchema, collection);
