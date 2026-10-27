// express-async-errors ships no TypeScript types. Importing it patches
// Express 4 so rejected promises from async handlers/middleware are
// forwarded to the error-handling middleware instead of hanging the request.
declare module 'express-async-errors';
