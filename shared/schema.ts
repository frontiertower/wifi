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
  isHidden: boolean("is_hidden").default(false),
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
  type: text("type").notNull(), // company, person, or community
  companyName: text("company_name"),
  contactPerson: text("contact_person"),
  communityName: text("community_name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  personCompany: text("person_company"), // Company name for person/citizen listings
  personTitle: text("person_title"), // Job title for person/citizen listings
  parentCommunityId: integer("parent_community_id"),
  floor: text("floor"),
  officeNumber: text("office_number"),
  phone: text("phone"),
  telegramUsername: text("telegram_username"),
  email: text("email"),
  website: text("website"),
  linkedinUrl: text("linkedin_url"),
  twitterHandle: text("twitter_handle"),
  logoUrl: text("logo_url"),
  description: text("description"),
  editSlug: text("edit_slug"), // Unique slug for edit URL
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
  tourType: text("tour_type").notNull(), // "group_tour" or "custom"
  groupTourSelection: text("group_tour_selection"), // If group tour, which one
  groupTourUrl: text("group_tour_url"), // Luma URL for the selected group tour
  tourDate: timestamp("tour_date"),
  tourTime: text("tour_time"),
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
  message: text("message"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  linkedinUrl: text("linkedin_url"),
  resumeUrl: text("resume_url"),
  minimumCompensation: integer("minimum_compensation"),
  noticePeriodWeeks: integer("notice_period_weeks"),
  valuesAlignment: boolean("values_alignment").default(false),
  startupYears: integer("startup_years"),
  paymentSystemsExperience: text("payment_systems_experience"),
  taxAdvisorExperience: text("tax_advisor_experience"),
  contractInterpretationLevel: integer("contract_interpretation_level"),
  investorRelationsExperience: text("investor_relations_experience"),
  executiveCollaboration: text("executive_collaboration"),
  motivationStatement: text("motivation_statement").notNull(),
  referralSource: text("referral_source"),
  portfolioUrl: text("portfolio_url"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const privateOfficeRentals = pgTable("private_office_rentals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  linkedIn: text("linked_in"),
  referredBy: text("referred_by"),
  preferredMoveInDate: timestamp("preferred_move_in_date"),
  numberOfPeople: integer("number_of_people"),
  budgetRange: text("budget_range"),
  officeRequirements: text("office_requirements"),
  status: text("status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const authenticatedMembers = pgTable("authenticated_members", {
  id: serial("id").primaryKey(),
  cookieId: text("cookie_id").notNull().unique(),
  ftUserId: text("ft_user_id"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenType: text("token_type"),
  expiresAt: timestamp("expires_at"),
  userInfo: jsonb("user_info"),
  codeVerifier: text("code_verifier"),
  csrfToken: text("csrf_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wifiPasswords = pgTable("wifi_passwords", {
  id: serial("id").primaryKey(),
  password: text("password").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminLogins = pgTable("admin_logins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").notNull(), // "Owner" or "Staff"
  loginTime: timestamp("login_time").defaultNow().notNull(),
  sessionToken: text("session_token").notNull().unique(),
});

export const jobListings = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // e.g., "Full-time", "Part-time", "Contract"
  description: text("description").notNull(),
  requirements: text("requirements"),
  salary: text("salary"),
  applyUrl: text("apply_url"),
  contactEmail: text("contact_email"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isApproved: boolean("is_approved").default(false),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const residencyBookings = pgTable("residency_bookings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  numberOfGuests: integer("number_of_guests").notNull(),
  roomPreference: text("room_preference").notNull(),
  specialRequests: text("special_requests"),
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
}).extend({
  // Make optional fields truly optional (allow empty strings)
  organization: z.string().optional(),
  eventCode: z.string().optional(),
  eventName: z.string().optional(),
  floor: z.string().optional(),
  purpose: z.string().optional(),
  host: z.string().optional(),
  tourInterest: z.string().optional(),
  phone: z.string().optional(),
  telegramUsername: z.string().optional(),
  name: z.string().optional(),
  ethereumAddress: z.string().optional(),
  registrationType: z.string().optional(),
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
  tourType: z.string().min(1, "Tour type is required"),
  tourDate: z.coerce.date().optional(),
  tourTime: z.string().optional(),
}).refine(
  (data) => {
    if (data.tourType === "custom" && (!data.tourDate || !data.tourTime)) {
      return false;
    }
    return true;
  },
  {
    message: "Date and time are required for custom tours",
    path: ["tourDate"],
  }
);

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

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  email: z.string().email("Valid email is required").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  motivationStatement: z.string().min(50, "Please provide a detailed motivation statement (minimum 50 characters)"),
  contractInterpretationLevel: z.number().min(1).max(5).optional(),
  startupYears: z.number().min(0).optional(),
});

export const insertPrivateOfficeRentalSchema = createInsertSchema(privateOfficeRentals).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required").min(1, "Email is required"),
  preferredMoveInDate: z.coerce.date().optional(),
});

export const insertWifiPasswordSchema = createInsertSchema(wifiPasswords).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(1, "Password is required"),
});

export const insertAdminLoginSchema = createInsertSchema(adminLogins).omit({
  id: true,
  loginTime: true,
});

export const insertJobListingSchema = createInsertSchema(jobListings).omit({
  id: true,
  createdAt: true,
  isActive: true,
  isFeatured: true,
  isApproved: true,
}).extend({
  title: z.string().min(1, "Job title is required").max(200, "Job title must be less than 200 characters"),
  company: z.string().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
  location: z.string().min(1, "Location is required").max(100, "Location must be less than 100 characters"),
  type: z.string().min(1, "Job type is required"),
  description: z.string().min(50, "Please provide a detailed job description (minimum 50 characters)").max(2000, "Description must be less than 2000 characters"),
  requirements: z.string().max(1000, "Requirements must be less than 1000 characters").optional(),
  salary: z.string().max(100, "Salary range must be less than 100 characters").optional(),
  applyUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  createdBy: z.string().max(100, "Name must be less than 100 characters").optional(),
});

export const insertResidencyBookingSchema = createInsertSchema(residencyBookings).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  numberOfGuests: z.number().min(1, "Must have at least 1 guest"),
  roomPreference: z.string().min(1, "Room preference is required"),
  specialRequests: z.string().optional(),
}).refine(
  (data) => new Date(data.checkOutDate) > new Date(data.checkInDate),
  { message: "Check-out date must be after check-in date", path: ["checkOutDate"] }
);

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
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type PrivateOfficeRental = typeof privateOfficeRentals.$inferSelect;
export type InsertPrivateOfficeRental = z.infer<typeof insertPrivateOfficeRentalSchema>;
export type AuthenticatedMember = typeof authenticatedMembers.$inferSelect;
export type WifiPassword = typeof wifiPasswords.$inferSelect;
export type InsertWifiPassword = z.infer<typeof insertWifiPasswordSchema>;
export type AdminLogin = typeof adminLogins.$inferSelect;
export type InsertAdminLogin = z.infer<typeof insertAdminLoginSchema>;
export type JobListing = typeof jobListings.$inferSelect;
export type InsertJobListing = z.infer<typeof insertJobListingSchema>;
export type ResidencyBooking = typeof residencyBookings.$inferSelect;
export type InsertResidencyBooking = z.infer<typeof insertResidencyBookingSchema>;
