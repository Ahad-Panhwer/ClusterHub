# GameTrack — Gaming Tournament & Match Management System

> **Project type:** Web Engineering Problem-Based Learning (PBL)  
> **Course:** SW417 — Web Engineering  
> **Project status:** Planning / starter repository — application features have not yet been implemented.

GameTrack is a focused, responsive web application for organizing gaming tournaments and managing match schedules and results. It is designed to meet the assignment requirement for at least three distinct CRUD modules, persistent database storage, frontend/backend integration, testing, deployment, and documentation.

## 1. The problem

Gaming tournament information is often spread across chat groups, spreadsheets, and manually maintained schedules. This can cause duplicate registrations, inconsistent records, confusion about match times, and incorrect standings.

GameTrack provides one place to manage:
- Games
- Tournaments
- Matches and results

It also includes the minimum supporting data needed to connect tournaments to games and matches to tournaments. Team registration is included as a supporting workflow, but the initial version deliberately avoids advanced features such as live game-server integration, chat, payments, streaming, notifications, complex bracket automation, or a social network.

## 2. Core scope

### Required CRUD modules

1. **Games:** create, view, edit, and delete game records.
2. **Tournaments:** create, view, edit, and delete tournaments linked to a game.
3. **Matches:** create, view, edit, and delete matches linked to a tournament.

### Supporting functionality

- Basic account authentication and roles.
- Teams and tournament registrations, kept simple.
- Match result recording.
- A basic leaderboard derived from completed match results.
- Search/filtering where useful.
- Responsive layouts, form validation, success/error messages, and delete confirmation.

The leaderboard is read-only and calculated from saved results. Do not add a separate manually editable ranking table in the first version.

## 3. Agreed technology stack

| Layer | Choice | Responsibility |
|---|---|---|
| Frontend | React + TypeScript, created with Google AI Studio | UI, forms, tables, responsive design, API client |
| Backend | Node.js + Express + TypeScript, developed with Google Antigravity | REST API, validation, authorization, business rules |
| Database | Supabase PostgreSQL | Persistent relational data and constraints |
| Authentication | Supabase Auth | User sign-in and identity |
| Frontend hosting | Netlify free tier, subject to current limits | Static frontend hosting |
| Backend hosting | Render free web service, subject to current limits | Express API hosting |
| Source control | GitHub | Version control and collaboration between AI tools |

**Architecture rule:** The frontend must communicate with the Express API. The backend is the trusted place for authorization, business rules, and database writes. Do not connect the frontend directly to PostgreSQL or put secret keys in frontend code.

Free plans can change, sleep, pause, or enforce quotas. Confirm current plan conditions before deployment. Free hosting cannot guarantee uninterrupted availability.

## 4. Core user roles

- **Administrator:** manages application-wide records and user roles.
- **Tournament organizer:** manages tournaments they own, registrations, matches, and results.
- **Team captain:** can manage their own team and view/register for eligible tournaments.

Keep authorization simple and enforce it on the server, not only by hiding frontend buttons. If role-based authentication would delay the core CRUD demo, implement a small but secure role model early rather than leaving public write endpoints unprotected.

## 5. Repository map

```text
GameTrack_Project/
├── README.md
├── .gitignore
├── .env.example
├── docs/
│   ├── PROJECT_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_CONTRACT.md
│   ├── DEVELOPMENT_PLAN.md
│   ├── TESTING_AND_DEPLOYMENT.md
│   └── AI_WORKFLOW.md
├── database/
│   ├── README.md
│   └── migrations/
│       └── 0001_initial_schema.sql
├── frontend/
│   └── README.md
└── backend/
    └── README.md
```

This is a documentation-first starter repository. The frontend and backend directories currently contain instructions rather than a finished application. Source files should be added in the phases defined in `docs/DEVELOPMENT_PLAN.md`.

## 6. Suggested implementation order

1. Read this README and all files in `docs/`.
2. Review the database schema and apply it to a development Supabase project.
3. Build and test the Express API against the hosted database.
4. Build the frontend in Google AI Studio and place/export its source into `frontend/`.
5. Connect the frontend to the API using `VITE_API_BASE_URL`.
6. Test locally, then deploy and verify the live application.
7. Complete the report, screenshots, test evidence, GitHub URL, and demonstration video.

Do not ask either AI tool to generate the entire system in one unreviewed step. Work incrementally and keep this documentation synchronized with actual decisions.

## 7. Environment variables

See `.env.example`. Keep real values in local environment files and deployment secret settings; never commit real secrets.

## 8. Documentation index

- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [API contract](docs/API_CONTRACT.md)
- [Development plan](docs/DEVELOPMENT_PLAN.md)
- [Testing and deployment](docs/TESTING_AND_DEPLOYMENT.md)
- [AI development workflow](docs/AI_WORKFLOW.md)

## 9. Assignment alignment

The project is intended to demonstrate:
- At least three distinct modules with full CRUD.
- Persistent database storage.
- Frontend-to-backend API integration.
- Responsive design and input validation.
- Meaningful success/error messages and delete confirmation.
- Testing, live deployment, report, source repository, and presentation.

Before submission, verify the final implementation against the instructor's assignment sheet and ensure you can explain the architecture, schema, and code.
