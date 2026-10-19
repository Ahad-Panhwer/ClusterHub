# Testing and Deployment

## 1. Minimum test matrix

| Area | Test | Expected result |
|---|---|---|
| Games | Create valid game | Record is saved and appears in list |
| Games | Submit missing title | Validation error; no record created |
| Games | Edit game | Saved changes appear after reload |
| Games | Delete referenced game | Safe refusal or documented policy |
| Tournaments | Create linked to a game | Tournament saved with valid relationship |
| Tournaments | Invalid date range | Request rejected |
| Registrations | Register same team twice | Duplicate rejected |
| Registrations | Register when full/closed | Request rejected |
| Matches | Create match with eligible teams | Match saved |
| Matches | Same team selected twice | Request rejected |
| Matches | Negative score | Request rejected |
| Leaderboard | Complete a match | Standings update from saved result |
| Security | Unauthenticated mutation | `401 Unauthorized` |
| Security | User edits another organizer's data | `403 Forbidden` |
| Persistence | Create record, reload, sign in again | Record remains available to authorized user |
| UI | Narrow mobile viewport | Layout remains usable |
| Deployment | Backend cold start | UI handles loading/retry gracefully |

Record actual pass/fail results; do not mark tests as passed before running them.

## 2. Local development

The exact commands depend on the package files created during implementation. The intended workflow is:

1. Install a supported Node.js LTS version.
2. Configure local backend environment variables.
3. Apply database migrations to the development Supabase project.
4. Start the Express backend.
5. Set `VITE_API_BASE_URL` in the frontend.
6. Start the Vite frontend.
7. Test frontend-to-backend communication and persistence.

The frontend and backend READMEs must be updated with exact commands once package scripts exist.

## 3. Production deployment

### Frontend — Netlify
- Connect the GitHub repository.
- Set the frontend base directory to `frontend` if using a monorepo.
- Set the build command and publish directory according to the actual Vite configuration.
- Set `VITE_API_BASE_URL` to the deployed API URL.
- Confirm SPA route fallback behavior if client-side routing is used.

### Backend — Render
- Create a web service from the backend directory.
- Set the build/start commands to match the real package scripts.
- Configure `PORT`, `FRONTEND_ORIGIN`, and Supabase server settings.
- Ensure the server binds to the host-provided port.
- Add health-check configuration if available.
- Remember that free services may spin down when idle.

### Database — Supabase
- Apply versioned migrations.
- Use the correct connection approach for the backend host.
- Configure authentication redirect URLs and allowed origins.
- Keep secrets in host environment settings.
- Export/backup important data and verify recovery steps.

## 4. Production smoke test
- Open the live frontend.
- Sign in.
- Create a game, tournament, and match.
- Refresh and verify records persist.
- Update and delete a test record.
- Verify authorization and validation failures.
- Test the site on a mobile viewport.
- Check API and database logs for errors.
- Remove demo data that should not remain.

## 5. Free-tier warning

Hosting providers change free-plan limits, sleep behavior, database pausing policies, and quotas. Verify the current terms before deployment. Free hosting is suitable for a student demo but does not guarantee continuous uptime or permanent free availability.
