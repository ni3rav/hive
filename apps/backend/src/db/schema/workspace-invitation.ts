import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspacesTable } from './workspace';
import { usersTable } from './auth';

export const workspaceInvitationsTable = pgTable(
  'workspace_invitations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('member'),
    invitedBy: uuid('invited_by')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 255 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('pending'), // pending | accepted | revoked | expired
    invitedAt: timestamp('invited_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at'),
  },
  (t) => [
    index('idx_workspace_invitations_workspace_id').on(t.workspaceId),
    index('idx_workspace_invitations_email').on(t.email),
    index('idx_workspace_invitations_status').on(t.status),
    uniqueIndex('uq_workspace_pending_invite').on(
      t.workspaceId,
      t.email,
      t.status,
    ),
  ],
);

export const workspaceInvitationsRelations = relations(
  workspaceInvitationsTable,
  ({ one }) => ({
    workspace: one(workspacesTable, {
      fields: [workspaceInvitationsTable.workspaceId],
      references: [workspacesTable.id],
    }),
    invitedByUser: one(usersTable, {
      fields: [workspaceInvitationsTable.invitedBy],
      references: [usersTable.id],
    }),
  }),
);
