import { createClient } from 'redis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is required');
}

export const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => {
  console.error('Redis error', err);
});

await redis.connect();
