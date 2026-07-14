import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const emailRateLimitsTable = pgTable(
  'email_rate_limits',
  {
    identifier: text('identifier').notNull(), // email or userId
    type: text('type').notNull(), // 'VERIFICATION', 'PASSWORD_RESET', 'WORKSPACE_INVITATION'
    lastSentAt: timestamp('last_sent_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.type] })],
);
