// Run as: npx ts-node --transpile-only worker.ts
import 'dotenv/config';
import { startWorker } from '@/queue/analysis.worker';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import fs from 'fs';

async function bootstrap() {
  // Ensure logs directory exists
  if (!fs.existsSync('logs')) fs.mkdirSync('logs');

  // Connect Redis
  if (!redis) {
    console.error('REDIS_URL is not set — cannot start worker.');
    process.exit(1);
  }
  await redis.connect();
  logger.info('Redis connected');

  // Start Bull worker
  startWorker();
  logger.info('Worker process running — listening for jobs');
}

bootstrap().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});