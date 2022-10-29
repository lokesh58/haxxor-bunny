import mongoose from 'mongoose';
import { AugmentCoreRanks } from '../constants/hi3';
import Character, { CharacterDocument } from '../models/hi3/Character';
import UserValkyrie from '../models/hi3/UserValkyrie';
import Valkyrie, { ValkyrieDocument } from '../models/hi3/Valkyrie';

export function isValidAugmentCoreRank(value: number): value is typeof AugmentCoreRanks[number] {
  return AugmentCoreRanks.includes(value as any);
}

export async function getValkyriesByKeyword(keyword: string, limit: number = 25): Promise<ValkyrieDocument[]> {
  const characters = await getCharactersByKeyword(keyword, -1);
  const regex = new RegExp(keyword, 'i');
  const valkyries = await Valkyrie.find({
    $or: [{ name: regex }, { acronyms: regex }, { character: { $in: characters.map((c) => c._id) } }],
  }).limit(limit);
  return valkyries;
}

export async function deleteValkyrie(valkyrieId: mongoose.Types.ObjectId): Promise<false | ValkyrieDocument | null> {
  if (await UserValkyrie.exists({ valkyrie: valkyrieId })) {
    return false;
  }
  const deletedValk = await Valkyrie.findByIdAndDelete(valkyrieId);
  return deletedValk;
}

export async function forceDeleteValkyrie(valkyrieId: mongoose.Types.ObjectId): Promise<ValkyrieDocument | null> {
  let deletedValk: ValkyrieDocument | null = null;
  await mongoose.connection.transaction(async (session) => {
    const [, _deletedValk] = await Promise.all([
      UserValkyrie.deleteMany({ valkyrie: valkyrieId }).session(session),
      Valkyrie.findByIdAndDelete(valkyrieId).session(session),
    ]);
    deletedValk = _deletedValk;
  });
  return deletedValk;
}

export async function getCharactersByKeyword(keyword: string, limit: number = 25): Promise<CharacterDocument[]> {
  const characters = await Character.find({ name: { $regex: new RegExp(keyword, 'i') } }).limit(limit);
  return characters;
}

export async function deleteCharacter(characterId: mongoose.Types.ObjectId): Promise<false | CharacterDocument | null> {
  if (await Valkyrie.exists({ character: characterId })) {
    return false;
  }
  const deletedChar = await Character.findByIdAndDelete(characterId);
  return deletedChar;
}

export async function forceDeleteCharacter(characterId: mongoose.Types.ObjectId): Promise<CharacterDocument | null> {
  let deletedChar: CharacterDocument | null = null;
  await mongoose.connection.transaction(async (session) => {
    const [, _deletedChar] = await Promise.all([
      Valkyrie.find({ character: characterId })
        .session(session)
        .then((charValks) =>
          Promise.all([
            UserValkyrie.deleteMany({ valkyrie: { $in: charValks.map((v) => v._id) } }).session(session),
            Valkyrie.deleteMany({ character: characterId }).session(session),
          ]),
        ),
      Character.findByIdAndDelete(characterId).session(session),
    ]);
    deletedChar = _deletedChar;
  });
  return deletedChar;
}
