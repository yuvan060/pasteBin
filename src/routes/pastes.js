import { Router } from 'express';
import { createPaste, getPasteAPI } from '../services/pasteService.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const result = await createPaste(req);
    res.status(201).json(result);
  } catch (err) {
    const status = err.status || 400;
    res.status(status).json({ error: err.message || 'Invalid request' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await getPasteAPI(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: 'Not Found' });
  }
});

export default router;
