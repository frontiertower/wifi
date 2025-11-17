CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"event_name" text NOT NULL,
	"event_description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"location" text,
	"organizer_name" text NOT NULL,
	"organizer_email" text NOT NULL,
	"organizer_phone" text,
	"organizer_linkedin" text,
	"organizer_twitter" text,
	"organizer_company" text,
	"status" text DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "captive_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"phone" text,
	"telegram_username" text,
	"session_id" text,
	"mac_address" text,
	"ip_address" text,
	"is_active" boolean DEFAULT true,
	"session_start" timestamp DEFAULT now(),
	"session_end" timestamp,
	"data_used" integer DEFAULT 0,
	"floor" text,
	"purpose" text,
	"host" text,
	"event_code" text,
	"event_name" text,
	"organization" text,
	"registration_type" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "captive_users_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"guest_count" integer DEFAULT 0 NOT NULL,
	"last_reset_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_stats_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"max_attendees" integer,
	"current_attendees" integer DEFAULT 0,
	"external_id" text,
	"source" text,
	"host" text,
	"color" text,
	"original_location" text,
	"url" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "events_code_unique" UNIQUE("code"),
	CONSTRAINT "events_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp,
	"ip_address" text,
	"mac_address" text,
	"bytes_in" integer DEFAULT 0,
	"bytes_out" integer DEFAULT 0,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"duration" integer NOT NULL,
	"is_used" boolean DEFAULT false,
	"used_by" text,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	CONSTRAINT "vouchers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_captive_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."captive_users"("id") ON DELETE no action ON UPDATE no action;