import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const captiveUsers = pgTable("captive_users", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // member, guest, event
  email: text("email").notNull(),
  name: text("name"),
  phone: text("phone"),
  telegramUsername: text("telegram_username"),
  sessionId: text("session_id").unique(),
  macAddress: text("mac_address"),
  ipAddress: text("ip_address"),
  isActive: boolean("is_active").default(true),
  sessionStart: timestamp("session_start").defaultNow(),
  sessionEnd: timestamp("session_end"),
  dataUsed: integer("data_used").default(0), // in MB
  // Member specific fields
  floor: text("floor"),
  // Guest specific fields
  purpose: text("purpose"),
  host: text("host"),
  // Event specific fields
  eventCode: text("event_code"),
  eventName: text("event_name"),
  organization: text("organization"),
  registrationType: text("registration_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vouchers = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // guest, event, member
  duration: integer("duration").notNull(), // in hours
  isUsed: boolean("is_used").default(false),
  usedBy: text("used_by"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => captiveUsers.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  ipAddress: text("ip_address"),
  macAddress: text("mac_address"),
  bytesIn: integer("bytes_in").default(0),
  bytesOut: integer("bytes_out").default(0),
  isActive: boolean("is_active").default(true),
});

// Relations
export const captiveUsersRelations = relations(captiveUsers, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(captiveUsers, {
    fields: [sessions.userId],
    references: [captiveUsers.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCaptiveUserSchema = createInsertSchema(captiveUsers).omit({
  id: true,
  sessionStart: true,
  createdAt: true,
  isActive: true,
  dataUsed: true,
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  isUsed: true,
  usedBy: true,
  usedAt: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  isActive: true,
  currentAttendees: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  startTime: true,
  endTime: true,
  bytesIn: true,
  bytesOut: true,
  isActive: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CaptiveUser = typeof captiveUsers.$inferSelect;
export type InsertCaptiveUser = z.infer<typeof insertCaptiveUserSchema>;
export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
