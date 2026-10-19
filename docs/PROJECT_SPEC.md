# Project Specification

## 1. Project identity

**Name:** GameTrack — Gaming Tournament & Match Management System  
**Course:** SW417 — Web Engineering  
**Project category:** Responsive CRUD-based website  
**Status:** Approved scope / pre-development specification

## 2. Problem statement

Gaming tournaments are frequently coordinated through disconnected chat groups, spreadsheets, and manually maintained match schedules. This can make it difficult to keep registrations, schedules, and results consistent. It can lead to duplicate entries, confusion about match times, and inaccurate standings.

GameTrack will provide a centralized web application for managing games, tournaments, matches, and results. It will use a persistent relational database and an API-based backend. The system will include complete Create, Read, Update, and Delete functionality in at least three distinct modules.

## 3. Objectives

1. Build a responsive and understandable web interface.
2. Implement full CRUD for Games, Tournaments, and Matches.
3. Persist all records in hosted PostgreSQL.
4. Connect the frontend and backend through a documented REST API.
5. Validate input on both client and server.
6. Enforce relationships and permissions.
7. Derive a basic leaderboard from completed matches.
8. Test locally and on the deployed application.
9. Provide the required project report and demonstration.

## 4. In-scope functionality

### Games
- Add a game with title, genre, platform, and optional description.
- List, search, view, edit, and delete games.
- Prevent deletion when referenced by tournaments unless a deliberate safe deletion policy is implemented.

### Tournaments
- Create a tournament linked to a game.
- Store name, format, capacity, start/end dates, status, and organizer.
- List and view tournament details.
- Edit and delete a tournament subject to relationship and authorization rules.
- Allow registrations only when the tournament is open and capacity is available.

### Matches
- Create a match for a tournament.
- Select two different teams that are registered for that tournament.
- Store round number, scheduled time, status, and scores.
- Update the schedule and result.
- View match details and results.
- Delete with confirmation, subject to authorization and audit expectations.

### Supporting teams and registrations
- Create and manage simple teams.
- Associate a captain and team members.
- Register a team once per tournament.
- Permit withdrawal only when tournament status and match progress allow it.

### Leaderboard
- Calculate standings from completed matches.
- Initial scoring rule: win = 3 points, loss = 0 points.
- If draws are enabled for a format, document and implement a draw rule consistently.
- Do not manually edit calculated rankings.

### Common interface behavior
- Responsive desktop, tablet, and mobile layouts.
- Accessible forms and labels.
- Required-field and format validation.
- Loading, empty, success, and error states.
- Confirmation before deletion.
- Search/filtering and pagination only where useful.

## 5. Explicitly out of scope for the first version

Do not build these unless the instructor later requires them:
- Real-time game-server integration or automatic game-stat import.
- Live chat, direct messages, or social feeds.
- Payments, prize payouts, or subscriptions.
- Streaming integration.
- Push notifications or email campaign systems.
- Complex automated double-elimination bracket generation.
- Mobile native applications.
- Microservices or an unnecessarily complex architecture.
- A separate analytics warehouse.

## 6. User roles

- Administrator: application-wide management.
- Tournament organizer: manages owned tournaments, registrations, matches, and results.
- Team captain: manages their team and participates in eligible tournament workflows.

All protected actions must be authorized by the backend. Hiding a button is not sufficient security.

## 7. Acceptance criteria

The project is ready for demonstration when:
1. Games support Create, Read, Update, Delete.
2. Tournaments support Create, Read, Update, Delete.
3. Matches support Create, Read, Update, Delete.
4. Data persists after refresh and a new browser session.
5. Invalid input is rejected with understandable messages.
6. Relationships prevent orphaned or inconsistent records.
7. Unauthorized users cannot modify records they do not own or administer.
8. The leaderboard is based on completed match results.
9. The interface is responsive.
10. The live URL, repository, report, and demo evidence are ready.
