# Development Plan

Build and verify one phase at a time. Do not generate the entire application in one unreviewed AI request.

## Phase 1 — Repository and scope
- [ ] Create a GitHub repository from this starter folder.
- [ ] Read the full documentation.
- [ ] Confirm the supported tournament formats and scoring rules.
- [ ] Keep this specification as the source of truth.

**Exit condition:** agreed scope, folder structure, and documented schema.

## Phase 2 — Database
- [ ] Create a Supabase project.
- [ ] Apply the initial migration.
- [ ] Add any missing constraints, indexes, and profile/auth integration.
- [ ] Verify relationships and uniqueness rules.
- [ ] Create non-sensitive demo data for local testing.

**Exit condition:** tables and constraints work in a clean development database.

## Phase 3 — Backend
- [ ] Create Node.js/Express/TypeScript application.
- [ ] Configure environment variables.
- [ ] Implement authentication verification.
- [ ] Implement server-side role and ownership checks.
- [ ] Implement Games CRUD and tests.
- [ ] Implement Tournaments CRUD and tests.
- [ ] Implement Matches CRUD and tests.
- [ ] Implement basic Teams and Registrations.
- [ ] Implement leaderboard query.
- [ ] Add consistent errors, validation, health endpoint, and API documentation.

**Exit condition:** API tests pass against the development database.

## Phase 4 — Frontend
- [ ] Create React/TypeScript frontend using Google AI Studio.
- [ ] Export/place source files into `frontend/`.
- [ ] Create reusable layout, navigation, form, table, and feedback components.
- [ ] Implement Games CRUD UI.
- [ ] Implement Tournaments CRUD UI.
- [ ] Implement Matches CRUD UI.
- [ ] Add supporting team/registration flows and leaderboard.
- [ ] Add responsive states and accessible labels.

**Exit condition:** all UI flows work against the real API, not mock data.

## Phase 5 — Integration and verification
- [ ] Configure frontend API base URL.
- [ ] Verify login and protected routes.
- [ ] Verify every CRUD operation.
- [ ] Verify relationship and capacity rules.
- [ ] Verify leaderboard calculations.
- [ ] Test mobile and desktop layouts.
- [ ] Fix errors before deployment.

**Exit condition:** documented test results with no known critical defects.

## Phase 6 — Deployment
- [ ] Deploy frontend to Netlify.
- [ ] Deploy API to Render.
- [ ] Configure production environment variables and CORS.
- [ ] Apply production database migrations.
- [ ] Configure authentication redirect URLs.
- [ ] Verify the live site and persistent database.
- [ ] Record any free-tier limitations.

**Exit condition:** live URL works and core CRUD is verified against production data.

## Phase 7 — Assignment deliverables
- [ ] Project report.
- [ ] Database design and relationship diagram.
- [ ] Screenshots of all CRUD operations.
- [ ] Testing table with actual results.
- [ ] Challenges and solutions.
- [ ] GitHub repository URL.
- [ ] Live application URL.
- [ ] Demonstration video and accessible link.

## Scope control

If time becomes limited, prioritize:
1. Three required CRUD modules.
2. Persistent database and API integration.
3. Validation and delete confirmation.
4. Deployment and test evidence.
5. Supporting team registration and leaderboard.

Do not add chat, payments, live game integrations, notifications, or complex tournament-bracket automation to the first version.
