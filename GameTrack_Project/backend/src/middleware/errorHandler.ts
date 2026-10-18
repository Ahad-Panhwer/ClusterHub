import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

/**
 * Centralized error handler. Must be registered LAST in the Express pipeline.
 * Returns a consistent error shape and never leaks stack traces in production.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the full error server-side for diagnosis
  if (!config.isProduction) {
    console.error('[ErrorHandler]', err);
  } else {
    // In production only log a summary, not the full stack
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[ErrorHandler] ${req.method} ${req.path} — ${message}`);
  }

  if (res.headersSent) return;

  // Map known error types to status codes
  const status = (err as any)?.status ?? (err as any)?.statusCode ?? 500;
  const message =
    config.isProduction && status === 500
      ? 'An unexpected error occurred.'
      : err instanceof Error
        ? err.message
        : 'An unexpected error occurred.';

  res.status(status).json({
    error: {
      code: status === 500 ? 'INTERNAL_ERROR' : 'ERROR',
      message,
    },
  });
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found.`,
    },
  });
}
