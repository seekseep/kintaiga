ALTER TYPE "public"."aggregation_unit" ADD VALUE 'weekly' BEFORE 'monthly';--> statement-breakpoint
ALTER TABLE "configurations" ADD COLUMN "aggregation_period" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "aggregation_period" integer;