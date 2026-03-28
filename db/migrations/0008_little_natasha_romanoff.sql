CREATE TYPE "public"."org_role" AS ENUM('owner', 'manager', 'member');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'premium');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(63) NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_name_unique" UNIQUE("name")
);--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"org_role" "org_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_org_user_unique" UNIQUE("organization_id","user_id")
);--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" varchar(21) NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reports_public_id_unique" UNIQUE("public_id")
);--> statement-breakpoint
-- Step 1: Add organization_id as nullable first
ALTER TABLE "configurations" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
-- Step 2: Create a default organization for existing data if any rows exist
INSERT INTO "organizations" ("id", "name", "plan")
SELECT gen_random_uuid(), 'default', 'free'
WHERE EXISTS (SELECT 1 FROM "projects" LIMIT 1)
   OR EXISTS (SELECT 1 FROM "configurations" LIMIT 1);--> statement-breakpoint
-- Step 3: Backfill existing rows with the default organization
UPDATE "projects" SET "organization_id" = (SELECT "id" FROM "organizations" WHERE "name" = 'default' LIMIT 1) WHERE "organization_id" IS NULL;--> statement-breakpoint
UPDATE "configurations" SET "organization_id" = (SELECT "id" FROM "organizations" WHERE "name" = 'default' LIMIT 1) WHERE "organization_id" IS NULL;--> statement-breakpoint
-- Step 4: Add existing users as members of the default organization
INSERT INTO "organization_members" ("organization_id", "user_id", "org_role")
SELECT o."id", u."id",
  CASE WHEN u."role" = 'admin' THEN 'owner'::"org_role" ELSE 'member'::"org_role" END
FROM "users" u, "organizations" o
WHERE o."name" = 'default';--> statement-breakpoint
-- Step 5: Set NOT NULL constraints
ALTER TABLE "configurations" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
-- Foreign keys and indexes
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organization_members_org_id_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organizations_name_idx" ON "organizations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "reports_public_id_idx" ON "reports" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "reports_organization_id_idx" ON "reports" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_organization_id_idx" ON "projects" USING btree ("organization_id");
