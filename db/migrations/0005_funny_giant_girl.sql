CREATE TABLE "deleted_activities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp,
	"note" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deleted_assignments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp,
	"created_at" timestamp NOT NULL,
	"deleted_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deleted_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "role" NOT NULL,
	"icon_url" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" uuid NOT NULL
);
