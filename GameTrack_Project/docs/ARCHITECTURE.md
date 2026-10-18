# Architecture

## 1. Overview

```text
Browser
  |
  v
React + TypeScript frontend
(Google AI Studio-assisted)
  |
  | HTTPS JSON REST requests
  v
Node.js + Express + TypeScript API
(Google Antigravity-assisted)
  |
  | Auth verification + database queries
  v
Supabase Auth + PostgreSQL
```

Deployment target:
- Frontend: Netlify static hosting.
- Backend: Render web service.
- Database/authentication: Supabase.

This is a simple three-layer architecture. Do not introduce microservices.

## 2. Responsibilities

### Frontend
- Display pages, tables, forms, and validation feedback.
- Call the Express API using a shared API client.
- Store only non-secret configuration in frontend environment variables.
- Never connect directly to PostgreSQL.
- Never use local storage or hardcoded sample arrays as the source of truth for application records.

### Backend
- Authenticate requests and verify user identity.
- Authorize roles and record ownership.
- Validate all input.
- Enforce business rules and relationships.
- Execute database operations.
- Return consistent HTTP status codes and JSON responses.
- Log operational errors without exposing secrets or sensitive data.

### Database
- Store durable records.
- Enforce primary keys, foreign keys, unique constraints, check constraints, and indexes.
- Use migrations that can be run repeatedly in a controlled order.
- Keep the authenticated user's ID linked to their profile.

## 3. Suggested source structure once implementation begins

```text
frontend/
  src/
    components/
    pages/
    layouts/
    services/
      apiClient.ts
    types/
    validation/
    App.tsx
    main.tsx
  public/
  package.json
  vite.config.ts
  README.md

backend/
  src/
    config/
    middleware/
    routes/
    controllers/
    services/
    repositories/
    validators/
    types/
    app.ts
    server.ts
  tests/
  package.json
  tsconfig.json
  README.md

database/
  migrations/
  README.md
```

Keep the backend structure proportionate. If a repository layer adds unnecessary complexity for a small module, use a consistent simpler service structure instead.

## 4. Authentication and security

- Use Supabase Auth for user identity.
- The frontend obtains an access token through the authentication flow.
- The backend verifies the token before protected actions.
- Role and ownership checks happen on the backend.
- Do not trust role names or ownership IDs supplied in request bodies.
- Keep service-role credentials on the server only; use them only where necessary.
- Configure allowed frontend origins explicitly.
- Validate and normalize input; use parameterized queries or safe database client methods.
- Return generic public errors; do not return stack traces or connection strings.

## 5. Deployment configuration

Frontend:
- `VITE_API_BASE_URL=https://<deployed-api-host>/api/v1`

Backend:
- `PORT` supplied by host, with a local default.
- `FRONTEND_ORIGIN` set to the deployed frontend origin.
- Supabase server configuration set in host environment settings.

Do not hardcode deployed URLs into source files. Do not commit secrets.
