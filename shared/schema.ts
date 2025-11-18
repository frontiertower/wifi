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
  ethereumAddress: text("ethereum_address"),
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
  tourInterest: text("tour_interest"),
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
  externalId: text("external_id").unique(),
  source: text("source"),
  host: text("host"),
  color: text("color"),
  originalLocation: text("original_location"),
  url: text("url"),
  imageUrl: text("image_url"),
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

export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(), // YYYY-MM-DD format
  guestCount: integer("guest_count").default(0).notNull(),
  lastResetAt: timestamp("last_reset_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  eventName: text("event_name").notNull(),
  eventDescription: text("event_description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location"),
  organizerName: text("organizer_name").notNull(),
  organizerEmail: text("organizer_email").notNull(),
  organizerPhone: text("organizer_phone"),
  organizerLinkedIn: text("organizer_linkedin"),
  organizerTwitter: text("organizer_twitter"),
  organizerCompany: text("organizer_company"),
  status: text("status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const directoryListings = pgTable("directory_listings", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // company or person
  companyName: text("company_name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  floor: text("floor"),
  officeNumber: text("office_number"),
  phone: text("phone"),
  telegramUsername: text("telegram_username"),
  email: text("email"),
  website: text("website"),
  logoUrl: text("logo_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tourBookings = pgTable("tour_bookings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  linkedIn: text("linked_in"),
  referredBy: text("referred_by"),
  tourDate: timestamp("tour_date").notNull(),
  tourTime: text("tour_time").notNull(),
  interestedInPrivateOffice: boolean("interested_in_private_office").default(false),
  numberOfPeople: integer("number_of_people"),
  status: text("status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventHostBookings = pgTable("event_host_bookings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  eventType: text("event_type"),
  expectedAttendees: integer("expected_attendees"),
  preferredDate: timestamp("preferred_date"),
  preferredTime: text("preferred_time"),
  eventDescription: text("event_description"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const membershipApplications = pgTable("membership_applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  telegram: text("telegram"),
  linkedIn: text("linked_in"),
  company: text("company"),
  website: text("website"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatInviteRequests = pgTable("chat_invite_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  telegram: text("telegram"),
  linkedIn: text("linked_in"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({
  id: true,
  createdAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  eventName: z.string().min(1, "Event name is required"),
  organizerName: z.string().min(1, "Organizer name is required"),
  organizerEmail: z.string().email("Valid email is required").min(1, "Email is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: "End date must be after start date", path: ["endDate"] }
);

export const insertDirectoryListingSchema = createInsertSchema(directoryListings).omit({
  id: true,
  createdAt: true,
});

export const insertTourBookingSchema = createInsertSchema(tourBookings).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required").min(1, "Email is required"),
  tourDate: z.coerce.date(),
  tourTime: z.string().min(1, "Tour time is required"),
});

export const insertEventHostBookingSchema = createInsertSchema(eventHostBookings).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required").min(1, "Email is required"),
  preferredDate: z.coerce.date().optional(),
});

export const insertMembershipApplicationSchema = createInsertSchema(membershipApplications).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
});

export const insertChatInviteRequestSchema = createInsertSchema(chatInviteRequests).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required").min(1, "Email is required"),
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
export type DailyStats = typeof dailyStats.$inferSelect;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type DirectoryListing = typeof directoryListings.$inferSelect;
export type InsertDirectoryListing = z.infer<typeof insertDirectoryListingSchema>;
export type TourBooking = typeof tourBookings.$inferSelect;
export type InsertTourBooking = z.infer<typeof insertTourBookingSchema>;
export type EventHostBooking = typeof eventHostBookings.$inferSelect;
export type InsertEventHostBooking = z.infer<typeof insertEventHostBookingSchema>;
export type MembershipApplication = typeof membershipApplications.$inferSelect;
export type InsertMembershipApplication = z.infer<typeof insertMembershipApplicationSchema>;
export type ChatInviteRequest = typeof chatInviteRequests.$inferSelect;
export type InsertChatInviteRequest = z.infer<typeof insertChatInviteRequestSchema>;
