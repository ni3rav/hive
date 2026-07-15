import { Response } from 'express';

export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

/**
 * 200 OK - Standard success response
 */
export function ok<T = unknown>(
  res: Response,
  message: string,
  data?: T,
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(200).json(response);
}

/**
 * 201 Created - Resource creation success
 */
export function created<T = unknown>(
  res: Response,
  message: string,
  data?: T,
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(201).json(response);
}

/**
 * 204 No Content - Success with no response body
 */
export function noContent(res: Response): Response {
  return res.status(204).send();
}

/**
 * 400 Bad Request - Validation errors or malformed requests
 */
export function badRequest(
  res: Response,
  message: string,
  details?: unknown,
): Response {
  const response: ErrorResponse = {
    success: false,
    message,
    code: 'BAD_REQUEST',
    ...(details !== undefined && { details }),
  };
  return res.status(400).json(response);
}

/**
 * 400 Bad Request - Validation errors with Zod issues
 */
export function validationError(
  res: Response,
  message: string,
  issues?: unknown,
): Response {
  const response: ErrorResponse = {
    success: false,
    message,
    code: 'VALIDATION_ERROR',
    ...(issues !== undefined && { details: { issues } }),
  };
  return res.status(400).json(response);
}

/**
 * 401 Unauthorized - Authentication required or failed
 */
export function unauthorized(
  res: Response,
  message = 'Unauthorized',
  details?: unknown,
): Response {
  const response: ErrorResponse = {
    success: false,
    message,
    code: 'UNAUTHORIZED',
    ...(details !== undefined && { details }),
  };
  return res.status(401).json(response);
}

/**
 * 403 Forbidden - Authenticated but not allowed
 */
export function forbidden(
  res: Response,
  message = 'Forbidden',
  details?: unknown,
): Response {
  const response: ErrorResponse = {
    success: false,
    message,
    code: 'FORBIDDEN',
    ...(details !== undefined && { details }),
  };
  return res.status(403).json(response);
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export function notFound(
  res: Response,
  message = 'Not found',
  details?: unknown,
): Response {
  const response: ErrorResponse = {
    success: false,
    message,
    code: 'NOT_FOUND',
    ...(details !== undefined && { details }),
  };
  return res.status(404).json(response);
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
export function conflict(
  res: Response,
  message: string,
  details?: unknown,
): Response {
  const response: ErrorResponse = {
    success: false,
    message,
    code: 'CONFLICT',
    ...(details !== undefined && { details }),
  };
  return res.status(409).json(response);
}

/**
 * 410 Gone - Resource no longer available (e.g., deprecated API version)
 */
export function gone(
  res: Response,
  message = 'Resource no longer available',
  details?: unknown,
): Response {
  const response: ErrorResponse = {
    success: false,
    message,
    code: 'GONE',
    ...(details !== undefined && { details }),
  };
  return res.status(410).json(response);
}

/**
 * 429 Too Many Requests - Rate limiting
 */
export function tooManyRequests(
  res: Response,
  message = 'Too many requests',
  details?: unknown,
): Response {
  const response: ErrorResponse = {
    success: false,
    message,
    code: 'TOO_MANY_REQUESTS',
    ...(details !== undefined && { details }),
  };
  return res.status(429).json(response);
}

/**
 * 500 Internal Server Error - Unexpected server errors
 */
export function serverError(
  res: Response,
  message = 'Internal server error',
  details?: unknown,
): Response {
  const response: ErrorResponse = {
    success: false,
    message,
    code: 'INTERNAL_ERROR',
    ...(details !== undefined && { details }),
  };
  return res.status(500).json(response);
}
