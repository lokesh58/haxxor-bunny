import mongoose, { Document, Model, model, models, Schema } from 'mongoose';
import { ValkyrieBaseRanks, ValkyrieNatures } from '../../constants/hi3';

export interface IValkyrie {
  character: Schema.Types.ObjectId;
  name: string;
  nature: typeof ValkyrieNatures[number]['value'];
  baseRank: typeof ValkyrieBaseRanks[number];
  acronyms: string[];
  emoji?: string;
  augEmoji?: string;
}

const valkSchema = new Schema<IValkyrie>({
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

export type ValkyrieDocument = Document<unknown, any, IValkyrie> & IValkyrie & { _id: mongoose.Types.ObjectId };

export const name = 'hi3-valkyrie';
export const collection = 'hi3-valkyries';
const Valkyrie: Model<IValkyrie> = models[name] || model(name, valkSchema, collection);

export default Valkyrie;
