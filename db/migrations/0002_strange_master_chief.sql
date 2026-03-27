CREATE TYPE "public"."aggregation_unit" AS ENUM('monthly', 'none');--> statement-breakpoint
CREATE TYPE "public"."rounding_direction" AS ENUM('ceil', 'floor');--> statement-breakpoint
CREATE TABLE "configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rounding_interval" integer DEFAULT 15 NOT NULL,
	"rounding_direction" "rounding_direction" DEFAULT 'ceil' NOT NULL,
	"aggregation_unit" "aggregation_unit" DEFAULT 'monthly' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "rounding_interval" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "rounding_direction" "rounding_direction";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "aggregation_unit" "aggregation_unit";