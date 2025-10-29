import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { authorTable } from './author';
import { workspacesTable } from './workspace';

export const postsTable = pgTable('posts', {
  id: uuid().defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').references(() => authorTable.id, {
    onDelete: 'set null',
  }),
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
