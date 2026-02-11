import { NextResponse } from 'next/server';
import { db } from '@/db';
import { agents } from '@/db/schema';
import { lte, sql } from 'drizzle-orm';

const SIX_MINUTES_MS = 360000;

/**
 * Cron endpoint to clean up expired agents and their messages.
 * Should be called every minute by an external cron service.
 *
 * Agents whose joinedAt + 6 minutes <= current time are considered expired.
 * Messages are automatically deleted via CASCADE constraint.
 */
export async function GET() {
  try {
    const now = Date.now();
    const expiryThreshold = now - SIX_MINUTES_MS;

    // Delete agents whose joinedAt + 6 minutes <= current time
    // Drizzle timestamp mode stores Unix SECONDS in SQLite, not milliseconds
    // When we pass a Date to Drizzle, it converts to seconds automatically
    const result = await db
      .delete(agents)
      .where(lte(agents.joinedAt, new Date(expiryThreshold)))
      .run();

    const deletedCount = result.changes || 0;

    return NextResponse.json({
      success: true,
      deletedAgents: deletedCount,
      timestamp: now,
    });
  } catch (error) {
    console.error('Error in GET /api/cron/cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
