import { Router } from 'express';
import { redis } from '../repositories/redisClient.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await redis.ping();
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

export default router;
