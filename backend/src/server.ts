import express, { Request, Response, NextFunction } from 'express';
import { router as authRouter } from './routes/auth';
import { router as userRouter } from './routes/user';
import { router as authorRouter } from './routes/author';
import { router as categoryRouter } from './routes/category';
import { router as workspaceRouter } from './routes/workspace';
import cookieParser from 'cookie-parser';
import { env } from './env';
import morgan from 'morgan';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import { badRequest, notFound, serverError } from './utils/responses';

export const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

app.use(cookieParser());
app.use(express.json());

if (env.isDevelopment) {
  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms'),
  );
}

if (env.isProduction) {
  app.use(morgan('combined'));
}

app.use('/api/auth', authRouter);
app.use('/api/user', authMiddleware, userRouter);
app.use('/api/author', authMiddleware, authorRouter);
app.use('/api/category', authMiddleware, categoryRouter);
app.use('/api/workspace', authMiddleware, workspaceRouter);

type BodyParserSyntaxError = SyntaxError & { type?: string; status?: number };

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  void _next;

  const parseErr = err as BodyParserSyntaxError;
  const isJsonParseError =
    err instanceof SyntaxError &&
    (parseErr?.type === 'entity.parse.failed' || parseErr?.status === 400);

  if (isJsonParseError) {
    return badRequest(
      res,
      'Invalid JSON Payload',
      'Ensure the JSON body is valid',
    );
  }

  return serverError(res, 'Internal Server Error');
});

app.use((req, res) => {
  return notFound(res, 'Route not found', { path: req.originalUrl });
});
