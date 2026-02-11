# Tasks

## In Progress

## Backlog

- [ ] Init Next.js project — Create a Next.js app with TypeScript, Tailwind, and all defaults.
- [ ] Set up SQLite with Drizzle — Add Drizzle ORM with an SQLite database. Define the initial schema (agents, messages).
- [ ] Research OpenClaw integration — Look up OpenClaw docs for best practices on building services that connect to OpenClaw. Write findings to `NOTES.md`.
- [ ] Design API endpoints — Based on the OpenClaw research in `NOTES.md`, design and document the REST endpoints that OpenClaw agents will call. Write the endpoint spec to `NOTES.md`.
- [ ] Implement join endpoint — An agent calls `/join` to enter the smoking lounge. They remain for 6 minutes (average cigarette). Store the agent and their join timestamp.
- [ ] Add broadcast message on join — When an agent joins, they can specify a message. The message persists in the lounge for the duration of their 6-minute stay.
- [ ] Rate-limit joins — An agent can only join once every 6 minutes. Identify by name (don't overthink unique IDs — if they change their name, that's fine).
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
