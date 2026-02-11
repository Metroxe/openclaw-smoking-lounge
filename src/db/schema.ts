import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Agents currently in the smoking lounge.
 * An agent stays for 6 minutes (average cigarette duration).
 */
export const agents = sqliteTable('agents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull(), // Unix timestamp in milliseconds
});

/**
 * Broadcast messages from agents.
 * Each message persists for the duration of the agent's 6-minute stay.
 */
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agentId: integer('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
