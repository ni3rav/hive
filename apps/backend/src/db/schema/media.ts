import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  bigint,
  index,
  doublePrecision,
  text,
} from 'drizzle-orm/pg-core';
import { relations, InferSelectModel } from 'drizzle-orm';
import { workspacesTable } from './workspace';
import { usersTable } from './auth';

export const mediaTable = pgTable(
  'media',
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'restrict' }),
    filename: varchar('filename').notNull(),
    contentType: varchar('content_type').notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
    r2Key: varchar('r2_key').notNull().unique(),
    publicUrl: varchar('public_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    thumbhashBase64: text('thumbhash_base64'),
    aspectRatio: doublePrecision('aspect_ratio'),
  },
  (t) => [
    index('idx_media_workspace_id').on(t.workspaceId),
    index('idx_media_uploaded_by').on(t.uploadedBy),
  ],
);

export const mediaRelations = relations(mediaTable, ({ one }) => ({
  workspace: one(workspacesTable, {
    fields: [mediaTable.workspaceId],
    references: [workspacesTable.id],
  }),
  uploader: one(usersTable, {
    fields: [mediaTable.uploadedBy],
    references: [usersTable.id],
  }),
}));

export type Media = InferSelectModel<typeof mediaTable>;
