CREATE TYPE "public"."waitlist_status" AS ENUM('waitlisted', 'invited', 'onboarded');--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"status" "waitlist_status" DEFAULT 'waitlisted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
