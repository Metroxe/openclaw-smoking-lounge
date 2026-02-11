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

## Run — 2026-02-11 (Task 7: Implement GET /api/messages)
**Task:** Implement GET /api/messages endpoint to return broadcast messages from active agents

**Implementation:**
- Created Next.js route handler at src/app/api/messages/route.ts
- Endpoint performs INNER JOIN between messages and agents tables
- Filters messages where associated agent hasn't expired: `gt(agents.joinedAt, new Date(expiryThreshold))`
- Returns JSON: `{ messages: [{ id, agentId, agentName, content, createdAt }] }`
- Orders results by createdAt descending (newest first)
- Returns empty array when no active messages exist

**Testing:**
- Tested with no messages → returns empty array
- Tested with multiple active messages → returns all in correct order
- Tested with agent without message → correctly excluded from messages list
- Tested with expired agent's message → correctly filtered out by join condition
- Verified all response fields (id, agentId, agentName, content, createdAt) are correct

**Decisions:**
- Used INNER JOIN so messages without valid agents are automatically excluded
- Expiry filtering happens at query level using agent's joinedAt timestamp
- Follows same error handling pattern as other API routes (500 for internal errors)
- Silent agents (no message) don't appear in messages response (expected behavior)

**Gotchas:**
- Must use `.innerJoin()` with explicit `eq()` condition in Drizzle
- The join condition filters by agent expiry, not message creation time
- Messages are naturally cleaned up by CASCADE delete when agent record is removed

**Next run should know:**
- GET /api/messages is fully implemented and tested at src/app/api/messages/route.ts
- All three core API endpoints now complete: POST /api/join, GET /api/agents, GET /api/messages
- Next task: Write expiry cron job for proactive cleanup of expired agents/messages
- After that: QA backend to test all endpoints together

## Run — 2026-02-11 (Task 6: Implement GET /api/agents)
**Task:** Implement GET /api/agents endpoint to return list of active agents

**Implementation:**
- Created Next.js route handler at src/app/api/agents/route.ts
- Endpoint returns JSON: `{ agents: [{ id, name, joinedAt, expiresAt }] }`
- Filters out expired agents by comparing `joinedAt + 6 minutes > current time`
- Uses Drizzle ORM with `gt(agents.joinedAt, new Date(expiryThreshold))` for filtering
- Orders results by joinedAt descending (newest first)
- Returns empty array when no active agents exist

**Testing:**
- Tested with no agents → returns empty array
- Tested with multiple active agents → returns all agents in correct order
- Tested with expired agent in database → correctly filters it out
- Verified all response fields (id, name, joinedAt, expiresAt) are correct

**Decisions:**
- Used Drizzle's Date object comparison for filtering (cleaner than raw SQL)
- Filter happens at query level (more efficient than filtering in JS)
- Follows same error handling pattern as POST /api/join (500 for internal errors)

**Gotchas:**
- Drizzle timestamp mode stores Unix seconds in SQLite, not milliseconds
- When reading, Drizzle returns Date objects (interprets stored seconds correctly)
- When calling `.getTime()` on these Date objects, get milliseconds for API response
- Important: When manually inserting test data, use seconds (not ms) to match schema

**Next run should know:**
- GET /api/agents is fully implemented and tested at src/app/api/agents/route.ts
- Filtering logic working correctly with Drizzle timestamp mode
- Next task: Implement GET /api/messages endpoint (get broadcast messages with agent names)
- After that: Write expiry cron job for proactive cleanup

## Run — 2026-02-11 (Task 5: Implement POST /api/join)
**Task:** Implement POST /api/join endpoint with broadcast messages and rate-limiting

**Implementation:**
- Created Next.js route handler at src/app/api/join/route.ts
- Endpoint accepts JSON body: `{ name: string, message?: string }`
- Validates name: 1-50 characters, required
- Validates message: max 280 characters, optional
- Rate-limiting: checks if agent with same name exists and hasn't expired (6 min = 360000ms)
  - Returns 429 if agent still active
  - Deletes expired agent record before creating new one if rejoining
- Creates agent record in `agents` table with joinedAt timestamp
- Creates message record in `messages` table if message provided (foreign key to agent with CASCADE delete)
- Returns success response with agent data, message data (if any), and expiresAt timestamp

**Testing:**
- Tested successful join with message → returns 200 with agent + message data
- Tested rate limiting → returns 429 when trying to rejoin before expiration
- Tested validation:
  - Empty/missing name → 400 error
  - Name too long (>50 chars) → 400 error
  - Message too long (>280 chars) → 400 error
- Tested join without message → returns 200 with message: null
- Verified data persistence in SQLite database

**Decisions:**
- Combined three separate tasks (implement join, add broadcast message, rate-limiting) into single endpoint implementation since they're all part of the same API endpoint
- Used Date objects for Drizzle timestamp mode, converted to Unix timestamps (ms) for JSON responses
- Lazy cleanup approach: expired agent records are only deleted when agent tries to rejoin, not proactively cleaned
- Empty/whitespace-only messages are treated as no message (message: null in response)

**Gotchas:**
- Drizzle timestamp mode returns Date objects from queries, need to call .getTime() for Unix timestamps
- Initial curl test had JSON escaping issues in shell, needed to use proper double-quote escaping

**Next run should know:**
- POST /api/join is fully implemented and tested at src/app/api/join/route.ts
- Database schema working correctly with CASCADE delete on messages
- Next task: Implement GET /api/agents endpoint (list active agents for frontend)
- Then: Implement GET /api/messages endpoint (get broadcast messages)
- Then: Write expiry cron job for proactive cleanup

## Run — 2026-02-11 (Task 4: API Endpoint Design)
**Task:** Design and document REST endpoints for OpenClaw agent interaction

**API Specification:**

### Endpoint: POST /api/join
**Purpose:** Agent joins the smoking lounge for 6 minutes (average cigarette duration)

**Request:**
```json
{
  "name": "string (required, 1-50 chars)",
  "message": "string (optional, max 280 chars, agent's broadcast message)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "agent": {
    "id": "number",
    "name": "string",
    "joinedAt": "number (Unix timestamp ms)"
  },
  "message": {
    "id": "number",
    "content": "string",
    "createdAt": "number"
  } | null,
  "expiresAt": "number (Unix timestamp ms, joinedAt + 6 minutes)"
}
```

**Error Responses:**
- `400` — Invalid request body (missing name, name too long, message too long)
- `429` — Rate limited (agent joined within last 6 minutes)

**Behaviors:**
- If agent with same name exists and hasn't expired, treat as rejoin attempt → 429 error
- If agent expired but still in DB, clean up old record and create new one
- Message is optional; if not provided, agent joins silently
- Agent and message both expire after 6 minutes from joinedAt timestamp

---

### Endpoint: GET /api/agents
**Purpose:** List all currently active agents (for frontend to render lobsters)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "agents": [
    {
      "id": "number",
      "name": "string",
      "joinedAt": "number",
      "expiresAt": "number"
    }
  ]
}
```

**Behaviors:**
- Returns only agents whose joinedAt + 6 minutes > current time
- Automatically excludes expired agents (no need to pre-clean DB, but good to do)
- Ordered by joinedAt descending (newest first)

---

### Endpoint: GET /api/messages
**Purpose:** Get all current broadcast messages (for speech bubbles in frontend)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "messages": [
    {
      "id": "number",
      "agentId": "number",
      "agentName": "string",
      "content": "string",
      "createdAt": "number"
    }
  ]
}
```

**Behaviors:**
- Returns messages whose agent hasn't expired (joinedAt + 6 minutes > current time)
- Joins with agents table to include agentName
- Ordered by createdAt descending (newest first)

---

### Implementation Notes

**Rate Limiting Logic:**
- When POST /api/join receives a request, query DB for agent with matching name
- If found and `joinedAt + 360000ms > Date.now()`, return 429
- If found and expired, delete old record before creating new one
- No complex session tokens or auth — simple name-based rate limiting

**Expiry Strategy:**
- Magic number: 360000ms = 6 minutes
- Frontend should poll GET /api/agents and GET /api/messages every 5-10 seconds
- Expired records cleaned up by:
  1. Cron job running every minute (separate task)
  2. Lazy cleanup on POST /api/join when agent rejoins
  3. Filtering in GET endpoints (don't return expired data)

**No Authentication for MVP:**
- Endpoints are open — any agent can call them
- Could add simple Bearer token later if abuse occurs
- For hackathon, simplicity > security

**Error Handling:**
- Use standard HTTP status codes
- Return JSON errors: `{ "error": "Error message" }`
- Log errors server-side for debugging

**Testing Strategy (for QA task):**
- Manual cURL tests for each endpoint
- Test rate limiting by calling /api/join twice rapidly
- Test expiry by waiting 6 minutes and checking GET endpoints
- Test message persistence and retrieval

**Decisions:**
- 6 minutes = 360000ms (average cigarette smoke time)
- Message length capped at 280 chars (Twitter-style, keeps UI manageable)
- Agent name length 1-50 chars (reasonable limits)
- No PATCH/DELETE endpoints — agents auto-expire, manual eviction not needed
- GET endpoints filter expired data instead of requiring pre-cleanup

**Next run should know:**
- API spec is now documented above
- Next task: Implement POST /api/join endpoint
- Use Next.js route handlers at src/app/api/join/route.ts
- Import db and schema from src/db/index.ts and src/db/schema.ts
- Return proper HTTP status codes and JSON responses

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
