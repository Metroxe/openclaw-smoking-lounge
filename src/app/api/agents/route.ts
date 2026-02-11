import { NextResponse } from 'next/server';
import { db } from '@/db';
import { agents } from '@/db/schema';
import { desc, gt, sql } from 'drizzle-orm';

const SIX_MINUTES_MS = 360000;

export async function GET() {
  try {
    const now = Date.now();
    const expiryThreshold = now - SIX_MINUTES_MS;

    // Query agents whose joinedAt + 6 minutes > current time
    // In SQLite with timestamp mode, joinedAt is stored as integer (Unix ms)
    const activeAgents = await db
      .select()
      .from(agents)
      .where(gt(agents.joinedAt, new Date(expiryThreshold)))
      .orderBy(desc(agents.joinedAt))
      .all();

    // Transform to response format
    const agentsResponse = activeAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      joinedAt: agent.joinedAt.getTime(),
      expiresAt: agent.joinedAt.getTime() + SIX_MINUTES_MS,
    }));

    return NextResponse.json({
      agents: agentsResponse,
    });
  } catch (error) {
    console.error('Error in GET /api/agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
