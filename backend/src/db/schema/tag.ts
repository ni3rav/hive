import {
  primaryKey,
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { workspacesTable } from './workspace';
import { postsTable } from './post';
import { relations } from 'drizzle-orm';

export const tagTable = pgTable(
  'tags',
  {
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 30 }).notNull(),
    slug: varchar('slug', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('idx_tags_workspace_id').on(t.workspaceId),
    primaryKey({
      name: 'tags_pk',
      columns: [t.slug, t.workspaceId],
    }),
  ],
);

export const postTagsTable = pgTable(
  'post_tags',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    tagSlug: varchar('tag_slug', { length: 50 }).notNull(),
    workspaceId: uuid('workspace_id').notNull(),
  },
  (t) => [
    index('idx_post_tags_post_id').on(t.postId),
    index('idx_post_tags_tag').on(t.tagSlug, t.workspaceId),
    primaryKey({
      name: 'post_tags_pk',
      columns: [t.postId, t.tagSlug],
    }),
    foreignKey({
      columns: [t.tagSlug, t.workspaceId],
      foreignColumns: [tagTable.slug, tagTable.workspaceId],
      name: 'fk_post_tags_tag',
    }).onDelete('cascade'),
  ],
);

export const tagRelations = relations(tagTable, ({ one, many }) => ({
  workspace: one(workspacesTable, {
    fields: [tagTable.workspaceId],
    references: [workspacesTable.id],
  }),
  postTags: many(postTagsTable),
}));

export const postTagsRelations = relations(postTagsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postTagsTable.postId],
    references: [postsTable.id],
  }),
  tag: one(tagTable, {
    fields: [postTagsTable.tagSlug, postTagsTable.workspaceId],
    references: [tagTable.slug, tagTable.workspaceId],
  }),
}));
