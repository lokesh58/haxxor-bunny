import mongoose, { Document, Model, model, models, Schema, Types } from 'mongoose';
import { PossibleAugmentBaseRanks, ValkyrieBaseRanks, ValkyrieNatures } from '../../constants/hi3';
import { name as CharacterModelName } from './Character';

export type IValkyrie = {
  character: Types.ObjectId;
  name: string;
  nature: typeof ValkyrieNatures[number];
  acronyms: string[];
  emoji?: string;
} & (
  | {
      baseRank: typeof ValkyrieBaseRanks[number];
      augEmoji?: undefined;
    }
  | {
      baseRank: typeof PossibleAugmentBaseRanks[number];
      augEmoji?: string;
    }
);

const valkSchema = new Schema<IValkyrie>({
  character: {
    type: Schema.Types.ObjectId,
    ref: CharacterModelName,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  nature: {
    type: String,
    enum: ValkyrieNatures,
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
