import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const golfRounds = pgTable("golf_rounds", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseName: text("course_name").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  totalScore: integer("total_score"),
  totalPar: integer("total_par").notNull().default(72),
  isCompleted: boolean("is_completed").notNull().default(false),
  currentHole: integer("current_hole").notNull().default(1),
});

export const golfHoles = pgTable("golf_holes", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  holeNumber: integer("hole_number").notNull(),
  par: integer("par").notNull(),
  yardage: integer("yardage"),
  score: integer("score"),
  putts: integer("putts"),
  fairwayInRegulation: boolean("fairway_in_regulation"),
  greenInRegulation: boolean("green_in_regulation"),
  notes: text("notes"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertGolfRoundSchema = createInsertSchema(golfRounds).omit({
  id: true,
  totalScore: true,
  isCompleted: true,
  currentHole: true,
});

export const insertGolfHoleSchema = createInsertSchema(golfHoles).omit({
  id: true,
});

export const updateGolfHoleSchema = createInsertSchema(golfHoles).omit({
  id: true,
  roundId: true,
  holeNumber: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGolfRound = z.infer<typeof insertGolfRoundSchema>;
export type GolfRound = typeof golfRounds.$inferSelect;
export type InsertGolfHole = z.infer<typeof insertGolfHoleSchema>;
export type GolfHole = typeof golfHoles.$inferSelect;
export type UpdateGolfHole = z.infer<typeof updateGolfHoleSchema>;

export interface RoundWithHoles extends GolfRound {
  holes: GolfHole[];
}

export interface RoundStats {
  averageScore: number;
  firPercentage: number;
  girPercentage: number;
  averagePutts: number;
  totalRounds: number;
}
