# AI-Assisted Development Workflow

This document defines how Google AI Studio and Google Antigravity should be used. The prompts for feature implementation will be prepared later, after the repository is reviewed. This file is guidance, not a request to generate the whole application at once.

## 1. Source of truth

Before making changes, the AI tool should read:
1. `README.md`
2. `docs/PROJECT_SPEC.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATABASE_SCHEMA.md`
5. `docs/API_CONTRACT.md`
6. `docs/DEVELOPMENT_PLAN.md`

If implementation conflicts with these documents, stop and explain the conflict rather than silently changing the scope.

## 2. Google AI Studio
Use for:
- Frontend layout and responsive design.
- React/TypeScript pages and reusable UI components.
- Form states and accessible interaction patterns.
- Exporting frontend code into the repository.

Do not use it to introduce a second competing backend or database architecture. The frontend must use the documented Express REST API.

## 3. Google Antigravity
Use for:
- Inspecting repository structure.
- Backend and database implementation.
- Migrations, validation, authorization, and API tests.
- Integrating frontend source with the backend API contract.
- Preparing deployment files and troubleshooting verified errors.

## 4. Safe incremental workflow
For every change:
1. Read the relevant documentation and existing code.
2. State the small task and expected files to change.
3. Implement only that task.
4. Run the relevant tests/build.
5. Report what changed and what was actually verified.
6. Update docs if an agreed design decision changes.
7. Review the Git diff before committing.

## 5. Rules for both tools
- Do not invent successful test results or claim a deployment occurred unless verified.
- Do not remove existing files without explaining why.
- Do not introduce heavy frameworks, microservices, or features outside the agreed scope.
- Do not use hardcoded mock arrays as production data.
- Do not expose credentials in frontend code or commit secrets.
- Do not bypass authentication/authorization for convenience.
- Keep names and API paths consistent with `docs/API_CONTRACT.md`.
- Ask before making a material change to scope, database, or hosting.
- Prefer clear code that a student can explain during the course presentation.
