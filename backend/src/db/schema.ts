import { pgTable, varchar, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 300 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: uuid().defaultRandom().primaryKey(), // session id
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const verificationLinksTable = pgTable("verification_links", {
  id: uuid().defaultRandom().primaryKey(),
  token: varchar("token").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull().defaultNow(),
  isVerified: boolean("is_verified").notNull(),
})