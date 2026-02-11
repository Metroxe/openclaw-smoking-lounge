# Tasks

## In Progress

## Backlog
- [ ] Implement GET /api/messages — Endpoint returns broadcast messages from active agents (not expired). Joins with agents table to include agentName. Returns messages ordered by createdAt descending.
- [ ] Write expiry cron — Create a cron job that removes expired messages and evicts agents whose 6 minutes are up.
- [ ] QA backend — Test all backend endpoints. If issues are found, add fix tasks immediately after this one in the backlog.
- [ ] Three.js lobby with lobsters — Build a Three.js homepage that renders a 3D lobster for each agent currently in the lounge. Each lobster gets a random colour.
- [ ] Style the smoking lounge — Make the Three.js environment look like a smoking lounge for lobsters.
- [ ] Speech bubbles — Display each lobster's broadcast message in a speech bubble floating above them.
- [ ] Add usage instructions — Write instructions on the page explaining how a user can tell their OpenClaw agent to interact with the smoking lounge.
- [ ] QA frontend — Test the frontend end-to-end. If issues are found, add fix tasks immediately after this one in the backlog.
- [ ] E2E test with real agent — Run an end-to-end test with a real OpenClaw agent. Use a Docker container if a fresh env is needed. Check GitHub via `gh` CLI for existing test harnesses first. If none exist, write a test strategy as new tasks after this one.
- [ ] Deploy to VPS — Deploy to the VPS accessible via `ssh openclaw-smoking-lounge`. No domain setup needed yet.
- [ ] Hackathon pivot — This project was built for a hackathon. The prompt: *"Build a DeFi application that makes trading more efficient on RobinPump.fun — a smart contract-based dApp or trading bot that provides enhanced liquidity and helps traders make more money."* Find the simplest possible angle that ties the smoking lounge to this prompt — a thin narrative connection is totally fine (e.g. rebrand broadcast messages as "trading signals", add a tagline, tweak the landing page copy). Do NOT build new smart contracts, DeFi integrations, or complex features. Minimum viable pivot. Write the narrative to `NOTES.md` first, then make the smallest changes needed. If implementation requires multiple steps, add them as new tasks immediately after this one.

## Done
- [x] Implement GET /api/agents — Implemented GET /api/agents endpoint that returns list of currently active agents (not expired). Filters out agents whose 6-minute session has expired, orders by joinedAt descending, and returns id, name, joinedAt, expiresAt fields.
- [x] Implement join endpoint — Implemented POST /api/join with broadcast message support and rate-limiting (6min cooldown). Endpoint validates name (1-50 chars) and message (max 280 chars), handles agent re-joins after expiry, and returns success/error responses per API spec.
- [x] Design API endpoints — Designed REST API spec for agent interaction. Three endpoints: POST /api/join (agent joins with message), GET /api/agents (list active agents), GET /api/messages (get broadcast messages). Full spec in NOTES.md.
- [x] Research OpenClaw integration — Researched OpenClaw docs for integration patterns. Key finding: Build standard REST API that agents call via HTTP, not a webhook consumer. Detailed findings in NOTES.md.
- [x] Set up SQLite with Drizzle — Add Drizzle ORM with an SQLite database. Define the initial schema (agents, messages).
- [x] Init Next.js project — Create a Next.js app with TypeScript, Tailwind, and all defaults.
