import {
  primaryKey,
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { workspacesTable } from './workspace';
import { postsTable } from './post';
import { relations } from 'drizzle-orm';

export const categoryTable = pgTable(
  'categories',
  {
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 30 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('idx_categories_workspace_id').on(t.workspaceId),
    primaryKey({
      name: 'id',
      columns: [t.slug, t.workspaceId],
    }),
  ],
);

export const categoryRelations = relations(categoryTable, ({ one, many }) => ({
  workspace: one(workspacesTable, {
    fields: [categoryTable.workspaceId],
    references: [workspacesTable.id],
  }),
  posts: many(postsTable),
}));
