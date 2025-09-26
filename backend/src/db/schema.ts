import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
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
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar("token").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull().defaultNow(),
});

export const authorTable = pgTable("authors", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  about: varchar("about").default(""),
  socialLinks: jsonb("social_links").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
