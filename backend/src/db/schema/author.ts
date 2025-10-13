import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { usersTable } from './auth';

export const authorTable = pgTable(
  'authors',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    name: varchar('name').notNull(),
    email: varchar('email').notNull(),
    about: varchar('about').default(''),
    socialLinks: jsonb('social_links').default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('idx_authors_user_id').on(t.userId)],
);
