import mongoose from 'mongoose';

export async function dbConnect() {
  if (mongoose.connection.readyState) return;
  console.log('Connecting to MongoDB');
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB');
}
