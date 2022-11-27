import { RESTGetAPIUserResult, Routes } from 'discord.js';
import { z } from 'zod';
import { ValkyrieNaturesDisplay } from '../../constants/hi3';
import UserValkyrie from '../../models/hi3/UserValkyrie';
import { IValkyrie } from '../../models/hi3/Valkyrie';
import { getFileUrl } from '../../utils/cdn';
import { restClient } from '../../utils/discord';
import { valkyrieCompare } from '../../utils/hi3';
import { publicProcedure, router } from '../trpc';

export const appRouter = router({
  getUserValkyries: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ input: { userId } }) => {
    const [userValks, user] = await Promise.all([
      UserValkyrie.find({ userId }).populate<{ valkyrie: IValkyrie }>({
        path: 'valkyrie',
      }),
      restClient.get(Routes.user(userId)) as Promise<RESTGetAPIUserResult>,
    ]);
    userValks.sort((a, b) => valkyrieCompare(a.valkyrie, b.valkyrie));
    return {
      valkyries: userValks.map((uv) => {
        const valkNature = ValkyrieNaturesDisplay[uv.valkyrie.nature];
        return {
          name: uv.valkyrie.name,
          picUrl: uv.valkyrie.emoji ? getFileUrl(uv.valkyrie.emoji) : null,
          augmentPicUrl: uv.valkyrie.augEmoji ? getFileUrl(uv.valkyrie.augEmoji) : null,
          rank: uv.rank.toUpperCase(),
          augmentCoreRank: uv.coreRank ?? null,
          nature: { display: valkNature.display, picUrl: getFileUrl(valkNature.emoji) },
        };
      }),
      userTag: `${user.username}#${user.discriminator}`,
    };
  }),
});

export type AppRouter = typeof appRouter;
