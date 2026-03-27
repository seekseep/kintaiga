DROP INDEX "assignments_project_user_idx";--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "started_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "ended_at" timestamp;