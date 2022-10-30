import { APIEmbed, RESTGetAPIUserResult, Routes } from 'discord.js';
import mongoose from 'mongoose';
import {
  AugmentCoreRanks,
  PossibleAugmentBaseRanks,
  ValkyrieBaseRanks,
  ValkyrieNatures,
  ValkyrieNaturesDisplay,
} from '../constants/hi3';
import Character, { CharacterDocument, ICharacter } from '../models/hi3/Character';
import UserValkyrie, { IUserValkyrie } from '../models/hi3/UserValkyrie';
import Valkyrie, { IValkyrie, ValkyrieDocument } from '../models/hi3/Valkyrie';
import { restClient } from './discord';

const LengthPerEmbed = 54;
const ZeroWidthSpace = '​';

export function valkyrieCompare(a: IValkyrie, b: IValkyrie): number {
  if (!a.character.equals(b.character)) {
    return a.character < b.character ? -1 : 1;
  }
  if (a.baseRank !== b.baseRank) {
    return ValkyrieBaseRanks.indexOf(a.baseRank) < ValkyrieBaseRanks.indexOf(b.baseRank) ? -1 : 1;
  }
  return ValkyrieNatures.indexOf(a.nature) <= ValkyrieNatures.indexOf(b.nature) ? -1 : 1;
}

export async function getUserValkyrieDisplayEmbeds(userId: string): Promise<APIEmbed[]> {
  const [userValks, user] = await Promise.all([
    UserValkyrie.find({ userId }).populate<{ valkyrie: IValkyrie }>({
      path: 'valkyrie',
      options: { sort: { character: 1, baseRank: 1, nature: 1 } },
    }),
    restClient.get(Routes.user(userId)) as Promise<RESTGetAPIUserResult>,
  ]);
  userValks.sort((a, b) => valkyrieCompare(a.valkyrie, b.valkyrie));
  return convertToDisplayEmbeds(userValks, UserValkyrieListDisplay, {
    title: `User Valkyries for ${user.username}#${user.discriminator}`,
    emptyText: '*No valkyrie data*',
  });
}

export function convertToDisplayEmbeds<T>(
  arr: T[],
  conversionFunc: (arg: T) => string,
  options: { title: string; emptyText: string },
): APIEmbed[] {
  if (arr.length === 0) {
    return [
      {
        title: options.title,
        description: options.emptyText,
      },
    ];
  }
  const numEmbeds = Math.ceil(arr.length / LengthPerEmbed);
  return [...Array(numEmbeds).keys()].map((i) => {
    const printArr = arr.slice(i * LengthPerEmbed, (i + 1) * LengthPerEmbed);
    const partSize = Math.ceil(printArr.length / 9);
    const numParts = Math.ceil(printArr.length / partSize);
    return {
      ...(i === 0 ? { title: options.title } : {}),
      fields: [...Array(numParts).keys()].map((j) => ({
        name: ZeroWidthSpace,
        value: printArr
          .slice(j * partSize, (j + 1) * partSize)
          .map(conversionFunc)
          .join('\n'),
        inline: true,
      })),
      ...(numEmbeds > 1 ? { footer: { text: `Page ${i + 1} of ${numEmbeds}` } } : {}),
    };
  });
}

export function UserValkyrieListDisplay(
  userValkyrie: Omit<IUserValkyrie, 'valkyrie'> & {
    valkyrie: Pick<IValkyrie, 'name' | 'emoji' | 'nature' | 'augEmoji'>;
  },
): string {
  const { valkyrie, rank, coreRank } = userValkyrie;
  return `**${valkyrie.name}** ${valkyrie.emoji ?? '-'} ${
    ValkyrieNaturesDisplay[valkyrie.nature].emoji
  } \`${rank.toUpperCase()}\`${coreRank ? ` ${valkyrie.augEmoji ?? '-'} ${coreRank}⭐` : ''}`;
}

export function ValkyrieListDisplay(valkyrie: IValkyrie): string {
  return `**${valkyrie.name}** ${valkyrie.emoji ?? '-'} \`${valkyrie.acronyms[0]}\` ${
    ValkyrieNaturesDisplay[valkyrie.nature].emoji
  }${'augEmoji' in valkyrie && valkyrie.augEmoji ? ` ${valkyrie.augEmoji}` : ''}`;
}

export function CharacterListDisplay(character: ICharacter): string {
  return `**${character.name}**${character.emoji ? ` ${character.emoji}` : ''}`;
}

export function isValidAugmentCoreRank(value: number): value is typeof AugmentCoreRanks[number] {
  return AugmentCoreRanks.includes(value as any);
}

export function isValidAugmentBaseRank(
  baseRank: typeof ValkyrieBaseRanks[number],
): baseRank is typeof PossibleAugmentBaseRanks[number] {
  return PossibleAugmentBaseRanks.includes(baseRank as any);
}

export function canValkyrieHaveAugment(
  valkyrie: IValkyrie,
): valkyrie is IValkyrie & { baseRank: typeof PossibleAugmentBaseRanks[number] } {
  return isValidAugmentBaseRank(valkyrie.baseRank);
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
