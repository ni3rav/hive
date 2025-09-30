import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  boolean,
  jsonb,
  text,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  password: varchar({ length: 300 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const sessionsTable = pgTable('sessions', {
  id: uuid().defaultRandom().primaryKey(), // session id
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const verificationLinksTable = pgTable('verification_links', {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  token: varchar('token').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull().defaultNow(),
});

export const workspacesTable = pgTable('workspaces', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
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

export const authorTable = pgTable('authors', {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  email: varchar('email').notNull(),
  about: varchar('about').default(''),
  socialLinks: jsonb('social_links').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const postsTable = pgTable('posts', {
  id: uuid().defaultRandom().primaryKey(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => authorTable.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  slug: varchar('slug').notNull().unique(),
  excerpt: varchar('excerpt').default('').notNull(),
  tags: varchar('tags', { length: 255 }).array().default([]).notNull(),
  category: varchar('category', { length: 255 }).default('').notNull(),
  visible: boolean('visible').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const postContentTable = pgTable('post_content', {
  id: uuid().defaultRandom().primaryKey(),
  postId: uuid('post_id')
    .notNull()
    .references(() => postsTable.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
});
