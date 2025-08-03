import {
  integer,
  pgTable,
  varchar,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 300 }).notNull(),
  createdAt: timestamp().defaultNow(),
});

export const sessionsTable = pgTable("sessions", {
  id: uuid().defaultRandom().primaryKey(), // session id
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});
