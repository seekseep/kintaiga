ALTER TABLE "organizations" ADD COLUMN "display_name" varchar(255) NOT NULL DEFAULT '';--> statement-breakpoint
UPDATE "organizations" SET "display_name" = "name" WHERE "display_name" = '';
