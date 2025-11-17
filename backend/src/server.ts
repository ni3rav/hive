import express, { Request, Response, NextFunction } from 'express';
import { router as authRouter } from './routes/auth';
import { router as userRouter } from './routes/user';
import { router as authorRouter } from './routes/author';
import { router as categoryRouter } from './routes/category';
import { router as tagRouter } from './routes/tag';
import { router as workspaceRouter } from './routes/workspace';
import { router as postRouter } from './routes/post';
import { router as invitationRouter } from './routes/invitation';
import cookieParser from 'cookie-parser';
import { env } from './env';
import cors from 'cors';
import helmet from 'helmet';
import { authMiddleware } from './middleware/auth';
import { badRequest, notFound, serverError } from './utils/responses';
import { db } from './db';
import { sql } from 'drizzle-orm';
import logger from './logger';
import pinoHTTP from 'pino-http';

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use(
  pinoHTTP({
    logger,
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    autoLogging: {
      ignore: (req) => req.url === '/api/health',
    },
    serializers: {
      req: () => undefined,
      res: () => undefined,
    },
  }),
);

app.use('/api/auth', authRouter);
app.use('/api/invitations', invitationRouter);
app.use('/api/user', authMiddleware, userRouter);
app.use('/api/author', authMiddleware, authorRouter);
app.use('/api/category', authMiddleware, categoryRouter);
app.use('/api/tag', authMiddleware, tagRouter);
app.use('/api/workspace', authMiddleware, workspaceRouter);
app.use('/api/post', authMiddleware, postRouter);
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    logger.error(error, 'Database health check failed');
    res.status(503).json({
      status: 'ERROR',
      database: 'disconnected',
    });
  }
});

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
