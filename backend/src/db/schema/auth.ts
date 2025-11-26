import { relations } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  boolean,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { workspaceUsersTable, workspacesTable } from './workspace';
import { postsTable } from './post';
import { workspaceApiKeysTable } from './workspace-api-key';

export const usersTable = pgTable(
  'users',
  {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    password: varchar({ length: 300 }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (t) => [index('idx_user_email').on(t.email)],
);

export const sessionsTable = pgTable(
  'sessions',
  {
    id: uuid().defaultRandom().primaryKey(), // session id
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (t) => [
    index('idx_session_user_id').on(t.userId),
    index('idx_session_expires_id').on(t.expiresAt),
  ],
);

export const verificationLinksTable = pgTable('verification_links', {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  token: varchar('token').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull().defaultNow(),
});

export const passwordResetLinksTable = pgTable(
  'password_reset_links',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    email: varchar('userEmail').notNull(),
    token: varchar('token').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (t) => [
    primaryKey({
      name: 'id',
      columns: [t.userId, t.token],
    }),
  ],
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  workspaceUsers: many(workspaceUsersTable),
  ownedWorkspaces: many(workspacesTable),
  createdPosts: many(postsTable),
  createdApiKeys: many(workspaceApiKeysTable),
}));
