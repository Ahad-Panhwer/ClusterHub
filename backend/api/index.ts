import { createApp } from '../src/app.js';
import { connectMongo, seedMongoIfEmpty } from '../src/lib/mongodb.js';
import { isMongoConfigured } from '../src/config/index.js';

const app = createApp();

export default async function handler(req: any, res: any) {
  if (isMongoConfigured()) {
    try {
      await connectMongo();
      await seedMongoIfEmpty();
    } catch (err) {
      console.error('MongoDB Atlas serverless connection error:', err);
    }
  }
  return app(req, res);
}
