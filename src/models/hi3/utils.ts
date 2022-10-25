import mongoose, { Document } from 'mongoose';
import Character, { ICharacter } from './Character';
import UserValkyrie from './UserValkyrie';
import Valkyrie from './Valkyrie';

type CharacterDocument = Document<unknown, any, ICharacter> & ICharacter & { _id: mongoose.Types.ObjectId };

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
