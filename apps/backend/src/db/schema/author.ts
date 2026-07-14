import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { workspacesTable } from './workspace';
import { relations } from 'drizzle-orm';
import { postsTable } from './post';

export const authorTable = pgTable(
  'authors',
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    name: varchar('name').notNull(),
    email: varchar('email').notNull(),
    about: varchar('about').default(''),
    socialLinks: jsonb('social_links').default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('idx_authors_workspace_id').on(t.workspaceId)],
);

export const authorRelations = relations(authorTable, ({ one, many }) => ({
  workspace: one(workspacesTable, {
    fields: [authorTable.workspaceId],
    references: [workspacesTable.id],
  }),
  posts: many(postsTable),
}));
