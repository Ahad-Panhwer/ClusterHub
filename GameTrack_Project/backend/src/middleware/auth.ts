import { Request, Response, NextFunction } from 'express';
import { verifySupabaseToken } from '../lib/supabase.js';
import { isSupabaseConfigured } from '../config/index.js';
import { AuthenticatedUser } from '../types/index.js';

// Extend the Express Request type to carry the verified user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication middleware.
 *
 * In production (Supabase configured):
 *   Expects a Bearer token in the Authorization header.
 *   Verifies it via Supabase Auth and populates req.user.
 *
 * In development (Supabase not configured):
 *   Accepts any token prefixed with "demo-" or "dev-" and creates a synthetic user.
 *   This allows the frontend's demo/email login to work without real Supabase credentials.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Provide a Bearer token.',
      },
    });
    return;
  }

  const token = authHeader.slice(7);

  if (isSupabaseConfigured()) {
    // Production path — verify real Supabase JWT
    const user = await verifySupabaseToken(token);
    if (!user) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'The provided token is invalid or has expired.',
        },
      });
      return;
    }
    req.user = { id: user.id, email: user.email };
    next();
    return;
  }

  // Development path — accept demo/dev tokens from the frontend's authService
  if (token.startsWith('demo-') || token.startsWith('dev-')) {
    req.user = {
      id: `dev-user-${token.slice(0, 24)}`,
      email: 'dev@clusterhub.local',
      role: 'organizer',
    };
    next();
    return;
  }

  res.status(401).json({
    error: {
      code: 'INVALID_TOKEN',
      message: 'Invalid or unsupported token format.',
    },
  });
}

/**
 * Optional authentication middleware.
 * Populates req.user if a valid token is present but does NOT reject unauthenticated requests.
 * Use this for endpoints that are publicly readable but show additional info when authenticated.
 */
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (isSupabaseConfigured()) {
      const user = await verifySupabaseToken(token);
      if (user) req.user = { id: user.id, email: user.email };
    } else if (token.startsWith('demo-') || token.startsWith('dev-')) {
      req.user = { id: `dev-user-${token.slice(0, 24)}`, email: 'dev@clusterhub.local', role: 'organizer' };
    }
  }
  next();
}
