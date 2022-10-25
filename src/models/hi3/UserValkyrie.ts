import { Model, model, models, Schema } from 'mongoose';
import { AugmentCoreRanks, ValkyrieRanks } from '../../constants/hi3';

export interface IUserValkyrie {
  userId: string;
  valkyrie: Schema.Types.ObjectId;
  rank: typeof ValkyrieRanks[number];
  coreRank?: typeof AugmentCoreRanks[number];
}

const userValkSchema = new Schema<IUserValkyrie>({
  userId: {
    type: String,
    required: true,
  },
  valkyrie: {
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
const UserValkyrie: Model<IUserValkyrie> = models[name] || model(name, userValkSchema, collection);

export default UserValkyrie;
