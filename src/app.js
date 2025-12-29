import express from 'express';
import helmet from 'helmet';
import healthRouter from './routes/health.js';
import pastesRouter from './routes/pastes.js';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));

app.use('/api/healthz', healthRouter);
app.use('/api/pastes', pastesRouter);

// HTML route for viewing a paste
app.get('/p/:id', async (req, res) => {
  const { getPasteForViewHTML } = await import('./services/pasteService.js');
  try {
    const html = await getPasteForViewHTML(req);
    res.status(200).send(html);
  } catch (err) {
    res.status(404).send('Not Found');
  }
});

// Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;
