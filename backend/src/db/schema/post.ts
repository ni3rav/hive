import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  jsonb,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { authorTable } from './author';
import { workspacesTable } from './workspace';
import { categoryTable } from './category';
import { postTagsTable } from './tag';
import { usersTable } from './auth';

export const postsTable = pgTable(
  'posts',
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'restrict' }),
    authorId: uuid('author_id').references(() => authorTable.id, {
      onDelete: 'set null',
    }),
    title: varchar('title').notNull(),
    slug: varchar('slug').notNull().unique(),
    excerpt: text('excerpt').default('').notNull(),
    categorySlug: varchar('category_slug', { length: 255 }),
    status: varchar('status', { length: 20 }).default('draft').notNull(),
    visible: boolean('visible').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at').notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    foreignKey({
      columns: [t.categorySlug, t.workspaceId],
      foreignColumns: [categoryTable.slug, categoryTable.workspaceId],
      name: 'fk_post_category',
    }).onDelete('set null'),
  ],
);

export const postContentTable = pgTable('post_content', {
  id: uuid().defaultRandom().primaryKey(),
  postId: uuid('post_id')
    .notNull()
    .references(() => postsTable.id, { onDelete: 'cascade' }),
  contentHtml: text('content_html').notNull(),
  contentJson: jsonb('content_json').notNull(),
});

export const postsRelations = relations(postsTable, ({ one, many }) => ({
  workspace: one(workspacesTable, {
    fields: [postsTable.workspaceId],
    references: [workspacesTable.id],
  }),
  creator: one(usersTable, {
    fields: [postsTable.createdBy],
    references: [usersTable.id],
  }),
  author: one(authorTable, {
    fields: [postsTable.authorId],
    references: [authorTable.id],
  }),
  category: one(categoryTable, {
    fields: [postsTable.categorySlug, postsTable.workspaceId],
    references: [categoryTable.slug, categoryTable.workspaceId],
  }),
  content: one(postContentTable, {
    fields: [postsTable.id],
    references: [postContentTable.postId],
  }),
  postTags: many(postTagsTable),
}));

export const postContentRelations = relations(postContentTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postContentTable.postId],
    references: [postsTable.id],
  }),
}));
