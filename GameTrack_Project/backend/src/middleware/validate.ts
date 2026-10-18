import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure, responds with 400 and a structured validation error.
 * On success, assigns the parsed (coerced) value back to req.body.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please correct the highlighted fields.',
          details,
        },
      });
      return;
    }
    // Replace body with the coerced/trimmed version from Zod
    req.body = result.data;
    next();
  };
}
