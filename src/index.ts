import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import multer from 'multer';

import { env } from './lib/env';
import { surveysRouter } from './routes/surveys';

const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api', surveysRouter);

app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          success: false,
          message: 'Ukuran file melebihi batas yang diizinkan.',
        });
        return;
      }

      res.status(400).json({ success: false, message: error.message });
      return;
    }

    console.error('[tcse-backend] unhandled error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Terjadi kesalahan pada server.' });
  },
);

app.listen(env.PORT, () => {
  console.log(`[tcse-backend] listening on port ${env.PORT}`);
});
