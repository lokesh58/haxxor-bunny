import type { NextApiRequest, NextApiResponse } from 'next';

export default async function CDNHandler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  return res.send({ message: 'works' });
}
