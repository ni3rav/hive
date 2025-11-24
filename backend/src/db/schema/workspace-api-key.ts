import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  char,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspacesTable } from './workspace';
import { usersTable } from './auth';

export const workspaceApiKeysTable = pgTable(
  'workspace_api_keys',
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    description: varchar('description', { length: 120 }).notNull(),
    hashedKey: char('hashed_key', { length: 64 }).notNull(),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at'),
    lastUsedIp: varchar('last_used_ip', { length: 45 }),
  },
  (table) => [
    index('idx_workspace_api_keys_workspace_id').on(table.workspaceId),
    index('idx_workspace_api_keys_created_by').on(table.createdByUserId),
    uniqueIndex('uq_workspace_api_keys_hashed_key').on(table.hashedKey),
  ],
);

export const workspaceApiKeysRelations = relations(
  workspaceApiKeysTable,
  ({ one }) => ({
    workspace: one(workspacesTable, {
      fields: [workspaceApiKeysTable.workspaceId],
      references: [workspacesTable.id],
    }),
    createdBy: one(usersTable, {
      fields: [workspaceApiKeysTable.createdByUserId],
      references: [usersTable.id],
    }),
  }),
);
