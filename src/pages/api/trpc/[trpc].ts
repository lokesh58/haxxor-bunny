import * as trpcNext from '@trpc/server/adapters/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { appRouter } from '../../../server/routers/_app';
import dbConnect from '../../../utils/dbConnect';

const actualTrpcHandler = trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});

export default async function TrpcHandler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  return actualTrpcHandler(req, res);
}
