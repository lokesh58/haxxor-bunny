import mongoose, { Document, Model, model, models, Schema } from 'mongoose';

export interface ICDNFile {
  filename: string;
  buffer: Buffer;
  type: string;
}

const CDNFileSchema = new Schema<ICDNFile>({
  filename: {
    type: String,
    required: true,
    unique: true,
  },
  buffer: {
    type: Buffer,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

export type CDNFileDocument = Document<unknown, any, ICDNFile> & ICDNFile & { _id: mongoose.Types.ObjectId };

export const name = 'cdn-file';
export const collection = 'cdn-files';
const CDNFile: Model<ICDNFile> = models[name] || model(name, CDNFileSchema, collection);

export default CDNFile;
