DROP INDEX IF EXISTS "users_email_idx";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
