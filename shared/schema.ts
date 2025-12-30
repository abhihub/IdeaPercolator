import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  rank: integer("rank").notNull().default(1),
  dateCreated: timestamp("date_created").notNull().defaultNow(),
  dateModified: timestamp("date_modified").notNull().defaultNow(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  published: boolean("published").notNull().default(false),
});

export const ideaVersions = pgTable("idea_versions", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").notNull().references(() => ideas.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  rank: integer("rank").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertIdeaSchema = createInsertSchema(ideas).pick({
  title: true,
  description: true,
  rank: true,
});

export const insertIdeaVersionSchema = createInsertSchema(ideaVersions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Idea = typeof ideas.$inferSelect;

export type InsertIdeaVersion = z.infer<typeof insertIdeaVersionSchema>;
export type IdeaVersion = typeof ideaVersions.$inferSelect;
