# Notes

<!--
  This file is the memory between loop runs.
  Each run should READ this first and APPEND a new entry at the top (below this header).
  Keep entries concise but specific — file paths, function names, reasoning.
  Delete stale entries when they're no longer relevant.
-->

<!-- Entry format:

## Run — YYYY-MM-DD
**Task:** What was worked on
**Decisions:** Any choices made and why
**Gotchas:** Anything surprising or tricky encountered
**Next run should know:** Anything that affects upcoming work

-->

## Run — 2026-02-11 (Task 2: SQLite + Drizzle setup)
**Task:** Set up SQLite with Drizzle ORM and define initial schema (agents, messages)

**Decisions:**
- Used `better-sqlite3` as the SQLite driver (more performant than alternatives for Node.js)
- Created two tables:
  - `agents` table at src/db/schema.ts:6 with fields: id (auto-increment), name (unique), joinedAt (timestamp)
  - `messages` table at src/db/schema.ts:14 with fields: id, agentId (FK to agents with cascade delete), content, createdAt
- Used timestamp mode for date fields (stores Unix timestamp in milliseconds)
- Added CASCADE delete on messages when agent is removed (so cleanup is automatic)
- Database file location: `./sqlite.db` (root of project)
- Added npm scripts: `db:generate`, `db:push`, `db:migrate`, `db:studio` for Drizzle operations

**Gotchas:**
- None encountered. Setup was straightforward.

**Next run should know:**
- Database connection is exported from src/db/index.ts as `db`
- Schema is exported from src/db/schema.ts as `agents` and `messages`
- SQLite database file (*.db) is gitignored
- Migration files are in /drizzle directory (should be committed)
- Next task: Research OpenClaw integration docs

## Run — 2026-02-11
**Task:** Init Next.js project with TypeScript, Tailwind, and all defaults

**Decisions:**
- Used Tailwind CSS v4 (latest stable) which has a different setup than v3
  - Uses `@import "tailwindcss"` instead of `@tailwind` directives
  - Requires `@tailwindcss/postcss` plugin instead of `tailwindcss` directly in postcss.config
- Created Next.js app with App Router (not Pages Router)
- Used `src/app` directory structure as specified in task requirements
- Set up TypeScript with strict mode enabled
- Added standard Next.js scripts: dev, build, start, lint

**Gotchas:**
- `create-next-app` wouldn't work in existing directory, had to set up manually
- Tailwind v4 has different PostCSS setup than v3 — had to install `@tailwindcss/postcss` separately
- Next.js build auto-modified tsconfig.json (changed jsx to react-jsx, added target ES2017)

**Next run should know:**
- Project structure is ready at /Users/cvp/Documents/projects/openclaw-smoking-lounge
- All base files created: src/app/layout.tsx, src/app/page.tsx, src/app/globals.css
- Build tested successfully with `npm run build`
- Next task will be setting up SQLite with Drizzle ORM
