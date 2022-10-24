import mongoose from 'mongoose';
import Character from './Character';
import UserValkyrie from './UserValkyrie';
import Valkyrie from './Valkyrie';

export async function deleteCharacter(characterId: mongoose.Types.ObjectId) {
  if (await Valkyrie.exists({ character: characterId })) {
    return false;
  }
  const deletedChar = await Character.findByIdAndDelete(characterId);
  return deletedChar;
}

export async function forceDeleteCharacter(characterId: mongoose.Types.ObjectId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [, deletedChar] = await Promise.all([
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
    await session.commitTransaction();
    return deletedChar;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}
