import { Request, Response, NextFunction } from 'express';
import { getUserIdbySession } from '../utils/sessions';
import { unauthorized } from '../utils/responses';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sessionId: string = req.cookies['session_id'];

  if (!sessionId) {
    return unauthorized(res, 'No active session');
  }

  const [sessionError, userId] = await getUserIdbySession(sessionId);

  if (sessionError) {
    return unauthorized(res, 'Invalid or expired session');
  }

  if (!userId) {
    return unauthorized(res, 'Invalid or expired session');
  }

  req.userId = userId;

  next();
}
