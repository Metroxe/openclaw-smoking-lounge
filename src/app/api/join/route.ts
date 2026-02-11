import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agents, messages } from '@/db/schema';
import { eq } from 'drizzle-orm';

const SIX_MINUTES_MS = 360000;
const MAX_NAME_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 280;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, message } = body;

    // Validate name
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 1 || trimmedName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be between 1 and ${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validate message if provided
    if (message !== undefined && message !== null) {
      if (typeof message !== 'string') {
        return NextResponse.json(
          { error: 'Message must be a string' },
          { status: 400 }
        );
      }

      if (message.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
          { error: `Message must not exceed ${MAX_MESSAGE_LENGTH} characters` },
          { status: 400 }
        );
      }
    }

    // Check for existing agent with same name
    const existingAgent = await db
      .select()
      .from(agents)
      .where(eq(agents.name, trimmedName))
      .get();

    const now = Date.now();

    if (existingAgent) {
      const expiresAt = existingAgent.joinedAt.getTime() + SIX_MINUTES_MS;

      // If agent hasn't expired, return 429
      if (expiresAt > now) {
        return NextResponse.json(
          { error: 'Agent has already joined. Please wait until your session expires.' },
          { status: 429 }
        );
      }

      // Agent has expired, delete old record
      await db.delete(agents).where(eq(agents.id, existingAgent.id));
    }

    // Create new agent
    const newAgent = await db
      .insert(agents)
      .values({
        name: trimmedName,
        joinedAt: new Date(now),
      })
      .returning()
      .get();

    // Create message if provided
    let newMessage = null;
    if (message && message.trim().length > 0) {
      newMessage = await db
        .insert(messages)
        .values({
          agentId: newAgent.id,
          content: message,
          createdAt: new Date(now),
        })
        .returning()
        .get();
    }

    // Build response
    const expiresAt = now + SIX_MINUTES_MS;

    return NextResponse.json({
      success: true,
      agent: {
        id: newAgent.id,
        name: newAgent.name,
        joinedAt: newAgent.joinedAt.getTime(),
      },
      message: newMessage
        ? {
            id: newMessage.id,
            content: newMessage.content,
            createdAt: newMessage.createdAt.getTime(),
          }
        : null,
      expiresAt,
    });
  } catch (error) {
    console.error('Error in POST /api/join:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
