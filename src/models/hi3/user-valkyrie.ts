import { model, Schema } from 'mongoose';
import { AugmentCoreRanks, ValkyrieRanks } from '../../utils/hi3';

export interface UserValkyrie {
  userId: string;
  valk: Schema.Types.ObjectId;
  rank: typeof ValkyrieRanks[number];
  coreRank?: typeof AugmentCoreRanks[number];
}

const userValkyrieSchema = new Schema<UserValkyrie>({
  userId: {
    type: String,
    required: true,
  },
  valk: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  rank: {
    type: String,
    enum: ValkyrieRanks,
    required: true,
  },
  coreRank: {
    type: Number,
    enum: AugmentCoreRanks,
    required: false,
  },
});

export const name = 'hi3-user-valkyrie';
export const collection = 'hi3-user-valkyries';

export default model(name, userValkyrieSchema, collection);
