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

## Run — 2026-02-11 (Task 3: OpenClaw Integration Research)
**Task:** Research OpenClaw integration — understand how to build services that OpenClaw agents can interact with

**Research Findings:**

### OpenClaw Overview
- Open-source, local-first personal AI assistant and agent framework
- 68,000+ GitHub stars, created by Peter Steinberger (PSPDFKit founder)
- Supports multi-agent routing, multi-channel messaging (WhatsApp, Telegram, Slack, Discord, etc.)
- Integrates with 50+ third-party services

### Integration Methods for External Services

**1. Webhook Endpoints (Recommended for Smoking Lounge)**
OpenClaw agents can trigger external services via HTTP webhooks. Gateway exposes endpoints:

- `/hooks/wake` — System events, triggers heartbeat (200 response)
  - Required: `text` (string) — event description
  - Optional: `mode` (`now` or `next-heartbeat`)

- `/hooks/agent` — Isolated agent runs (202 async response)
  - Required: `message` (string) — prompt for agent
  - Optional: `agentId`, `sessionKey`, `deliver`, `channel`, `model`, `timeoutSeconds`

- `/hooks/<name>` — Custom mapped endpoints via config

**Authentication:** Shared secret token via:
- `Authorization: Bearer <token>` (recommended)
- `x-openclaw-token: <token>` header
- `?token=<token>` query param (deprecated)

**Example:**
```bash
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'x-openclaw-token: SECRET' \
  -d '{"message":"Summarize inbox","name":"Email"}'
```

**2. Skills System (More Complex, Not Needed for MVP)**
- Skills are directories with SKILL.md files (YAML frontmatter + instructions)
- Loaded from bundled/managed/workspace locations
- Can reference custom HTTP endpoints via config
- Discoverable via ClawHub registry (https://clawhub.com)
- Requires npm package/SDK setup for complex integrations

### Recommended Architecture for Smoking Lounge

**For OpenClaw agents to interact with the smoking lounge, we should build:**

1. **REST API endpoints** that agents can call via HTTP requests (not webhooks FROM OpenClaw, but TO our service)
2. **Simple skill definition** (optional, for discoverability) that tells agents how to use our endpoints
3. **No authentication complexity** for MVP — simple token or open endpoints fine for hackathon

**Agent workflow:**
1. Agent executes skill or receives instruction: "Join the smoking lounge at <URL>"
2. Agent makes HTTP POST to `/api/join` with `{ name: "AgentName", message: "Optional broadcast" }`
3. Service stores agent in SQLite, returns success
4. Frontend polls or uses SSE to display active agents as lobsters

**Key insight:** We're building a service that OpenClaw agents consume (like any REST API), NOT building an OpenClaw skill package or webhook consumer. Agents will use standard HTTP tools/capabilities to call our endpoints.

**Decisions:**
- Use standard REST API approach (POST /api/join, GET /api/agents, etc.) instead of complex webhook/skill system
- Keep authentication simple for MVP (API key or open endpoints)
- Agents interact via HTTP requests they initiate, not via OpenClaw Gateway webhooks
- Optional: Create SKILL.md file later for ClawHub discoverability, but not required for functionality

**Gotchas:**
- Initial confusion about direction of integration — we're building a service agents call, not a webhook consumer
- Webhook system is for triggering OpenClaw agents FROM external events, not relevant for our use case

**Next run should know:**
- Next task is to design API endpoints based on this understanding
- Focus on: POST /api/join (with rate limiting), GET /api/agents (active agents), automatic expiry after 6min
- Consider adding GET /api/messages endpoint for frontend polling
- Authentication can be simple or omitted for MVP

**Sources:**
- [OpenClaw Webhooks Documentation](https://docs.openclaw.ai/automation/webhook)
- [OpenClaw Skills Documentation](https://docs.openclaw.ai/tools/skills)
- [OpenClaw GitHub Repository](https://github.com/openclaw/openclaw)
- [What is OpenClaw? (DigitalOcean)](https://www.digitalocean.com/resources/articles/what-is-openclaw)
- [OpenClaw Custom Skill Creation Guide](https://zenvanriel.nl/ai-engineer-blog/openclaw-custom-skill-creation-guide/)

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
