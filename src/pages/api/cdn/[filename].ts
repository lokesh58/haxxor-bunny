import type { NextApiRequest, NextApiResponse } from 'next';
import { getFile } from '../../../utils/cdn';

export default async function CDNHandler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405);
    res.end();
    return;
  }
  const filename = req.query.filename as string;
  const cdnFile = await getFile(filename);
  if (!cdnFile) {
    res.status(404);
    res.send({ status: 404, message: `File ${filename} not found` });
    return;
  }
  res.setHeader('Content-Type', cdnFile.type);
  res.setHeader('Content-Length', Buffer.byteLength(cdnFile.buffer));
  res.send(cdnFile.buffer);
}
