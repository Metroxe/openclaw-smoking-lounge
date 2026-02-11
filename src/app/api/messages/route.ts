import { NextResponse } from 'next/server';
import { db } from '@/db';
import { agents, messages } from '@/db/schema';
import { desc, gt, eq } from 'drizzle-orm';

const SIX_MINUTES_MS = 360000;

export async function GET() {
  try {
    const now = Date.now();
    const expiryThreshold = now - SIX_MINUTES_MS;

    // Query messages where the associated agent hasn't expired
    // Join with agents table to get agentName
    const activeMessages = await db
      .select({
        id: messages.id,
        agentId: messages.agentId,
        agentName: agents.name,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .innerJoin(agents, eq(messages.agentId, agents.id))
      .where(gt(agents.joinedAt, new Date(expiryThreshold)))
      .orderBy(desc(messages.createdAt))
      .all();

    // Transform to response format
    const messagesResponse = activeMessages.map((msg) => ({
      id: msg.id,
      agentId: msg.agentId,
      agentName: msg.agentName,
      content: msg.content,
      createdAt: msg.createdAt.getTime(),
    }));

    return NextResponse.json({
      messages: messagesResponse,
    });
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
