import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from './auth';

export const userAiSettingsTable = pgTable(
  'user_ai_settings',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 32 }).notNull().default('gemini'),
    encryptedApiKey: text('encrypted_api_key').notNull(),
    model: varchar('model', { length: 100 }).notNull().default('gemini-2.5-flash'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('idx_user_ai_settings_provider').on(t.provider)],
);

export const userAiSettingsRelations = relations(userAiSettingsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userAiSettingsTable.userId],
    references: [usersTable.id],
  }),
}));
