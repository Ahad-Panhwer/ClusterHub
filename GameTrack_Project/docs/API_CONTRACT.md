# API Contract

Base path: `/api/v1`

All request and response bodies use JSON. Protected routes require a valid bearer token. The backend must verify identity, role, and ownership.

## 1. Standard responses

Success response example:
```json
{
  "data": {
    "id": "uuid",
    "name": "Example"
  }
}
```

List response example:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

Error response example:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "details": []
  }
}
```

Use suitable status codes: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, and `500`. Do not expose stack traces in production.

## 2. Required CRUD routes

### Games
- `GET /games` — list, optional search and pagination.
- `POST /games` — create.
- `GET /games/:id` — read one.
- `PATCH /games/:id` — update.
- `DELETE /games/:id` — delete if no protected relationships prevent it.

### Tournaments
- `GET /tournaments` — list and filter.
- `POST /tournaments` — create.
- `GET /tournaments/:id` — read one.
- `PATCH /tournaments/:id` — update.
- `DELETE /tournaments/:id` — delete only when allowed.

### Matches
- `GET /matches` — list and filter by tournament/status.
- `POST /matches` — create.
- `GET /matches/:id` — read one.
- `PATCH /matches/:id` — update schedule, status, or result.
- `DELETE /matches/:id` — delete only when authorized and allowed.

### Supporting endpoints
- `GET /teams`, `POST /teams`, `GET /teams/:id`, `PATCH /teams/:id`, `DELETE /teams/:id`
- `GET /registrations`, `POST /registrations`, `PATCH /registrations/:id`, `DELETE /registrations/:id` or a documented withdrawal action.
- `GET /tournaments/:id/leaderboard`
- `GET /health`

## 3. Validation rules

- Required text must not be empty after trimming.
- Scores must be non-negative integers.
- Start/end dates must be valid; end must not precede start.
- Capacity must be a positive integer.
- A team cannot register twice in one tournament.
- Registration requires an open tournament and available capacity.
- Match participants must be different and registered for that tournament.
- A completed match must have the required result fields.
- Only authorized roles can mutate records.

## 4. API design rules

- Use `PATCH` for partial updates.
- Use pagination for potentially long lists.
- Do not return password or secret fields.
- Return `409 Conflict` for duplicate registrations or conflicting state.
- Keep leaderboard results derived from completed matches.
- Keep the frontend API base URL configurable through `VITE_API_BASE_URL`.
