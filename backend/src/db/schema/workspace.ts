import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { usersTable } from './auth';
import { authorTable } from './author';
import { relations } from 'drizzle-orm';

export const workspacesTable = pgTable('workspaces', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar('name', { length: 30 }).notNull(),
  slug: varchar('slug', { length: 35 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const workspaceUsersTable = pgTable(
  'workspace_users',
  {
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).default('member').notNull(),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: 'workspace_user_id',
      columns: [t.workspaceId, t.userId],
    }),
  ],
);

export const workspacesRelations = relations(workspacesTable, ({ many }) => ({
  workspaceUsers: many(workspaceUsersTable),
  authors: many(authorTable),
}));

export const workspaceUsersRelations = relations(
  workspaceUsersTable,
  ({ one }) => ({
    workspace: one(workspacesTable, {
      fields: [workspaceUsersTable.workspaceId],
      references: [workspacesTable.id],
    }),
    user: one(usersTable, {
      fields: [workspaceUsersTable.userId],
      references: [usersTable.id],
    }),
  }),
);
