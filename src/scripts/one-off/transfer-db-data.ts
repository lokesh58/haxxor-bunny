import mongoose, { Schema, Types } from 'mongoose';
import { ValkyrieNatures } from '../../constants/hi3';
import Character from '../../models/hi3/Character';
import UserValkyrie from '../../models/hi3/UserValkyrie';
import Valkyrie from '../../models/hi3/Valkyrie';

const reqString = {
  type: String,
  required: true,
};

const oldCharSchema = new Schema<{ name: string }>({
  name: {
    type: String,
    required: true,
  },
});

const oldValkSchema = new Schema<{
  characterId: string;
  name: string;
  natureId: string;
  baseRank: string;
  acronyms: string[];
  emoji?: string;
  augEmoji?: string;
}>({
  characterId: reqString,
  name: reqString,
  natureId: reqString,
  baseRank: reqString,
  acronyms: {
    type: [String],
    required: true,
  },
  emoji: String,
  augEmoji: String,
});

const oldUserValkSchema = new Schema<{ userId: string; valkId: string; rank: string; coreRank?: string }>({
  userId: reqString,
  valkId: reqString,
  rank: reqString,
  coreRank: String,
});

function toNameCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/(\s|-|^)\w/g, (t) => t.toUpperCase())
    .replace(/\sof\s/gi, (t) => t.toLowerCase())
    .replace(/\sthe\s/gi, (t) => t.toLowerCase());
}

function toAcronymCase(acronym: string): string {
  const exceptions = [
    'HoV',
    'StFu',
    'HoT',
    'HoR',
    'Kriegs',
    'HoS',
    'Miko',
    'Meme',
    'Delta',
    'Nyx',
    'HoF',
    'Ely',
    'SnS',
    'DiP',
    'SpA',
    'HoH',
  ];
  return exceptions.find((e) => e.toLowerCase() === acronym.toLowerCase()) ?? acronym.toUpperCase();
}

async function main() {
  const [, , oldDbUri, newDbUri] = process.argv;
  const oldDb = mongoose.createConnection(oldDbUri);
  try {
    await mongoose.connect(newDbUri);
    const OldCharacter = oldDb.model('valk-characters', oldCharSchema);
    const OldValkyrie = oldDb.model('valk-battlesuits', oldValkSchema);
    const OldUserValkyrie = oldDb.model('user-valks', oldUserValkSchema);

    // Nature
    const natureMap: Record<string, typeof ValkyrieNatures[number]> = {
      '60640edb31859e36306f0a51': 'mech',
      '60640ee831859e36306f0a52': 'bio',
      '60640f0331859e36306f0a53': 'psy',
      '60640f0f31859e36306f0a54': 'qua',
      '617178ca1e059f0004108a8e': 'imag',
    };

    // Characters
    const charMap = new Map<string, Types.ObjectId>();
    const oldChars = await OldCharacter.find();
    for (const ochar of oldChars) {
      const nchar = await new Character({ name: toNameCase(ochar.name) }).save();
      charMap.set(ochar._id.toString(), nchar._id);
    }

    // Valkyries
    const valkMap = new Map<string, Types.ObjectId>();
    const oldValks = await OldValkyrie.find();
    for (const ovalk of oldValks) {
      const nvalk = await new Valkyrie({
        character: charMap.get(ovalk.characterId),
        name: toNameCase(ovalk.name),
        nature: natureMap[ovalk.natureId],
        baseRank: ovalk.baseRank,
        acronyms: ovalk.acronyms.map(toAcronymCase),
        emoji: ovalk.emoji,
        augEmoji: ovalk.augEmoji,
      }).save();
      valkMap.set(ovalk._id.toString(), nvalk._id);
    }

    // User Valkyries
    const oldUserValks = await OldUserValkyrie.find();
    for (const ouvalk of oldUserValks) {
      await new UserValkyrie({
        userId: ouvalk.userId,
        valkyrie: valkMap.get(ouvalk.valkId),
        rank: ouvalk.rank,
        ...(ouvalk.coreRank ? { coreRank: +ouvalk.coreRank } : {}),
      }).save();
    }
  } finally {
    await Promise.all(mongoose.connections.map((conn) => conn.close()));
  }
}

main();
