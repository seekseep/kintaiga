-- Rename enum type: org_role -> organization_role
ALTER TYPE "public"."org_role" RENAME TO "organization_role";--> statement-breakpoint
-- Rename enum value: member -> worker
ALTER TYPE "public"."organization_role" RENAME VALUE 'member' TO 'worker';--> statement-breakpoint
-- Rename table: organization_members -> organization_assignments
ALTER TABLE "organization_members" RENAME TO "organization_assignments";--> statement-breakpoint
-- Rename column: org_role -> role
ALTER TABLE "organization_assignments" RENAME COLUMN "org_role" TO "role";--> statement-breakpoint
-- Rename unique constraint
ALTER TABLE "organization_assignments" RENAME CONSTRAINT "organization_members_org_user_unique" TO "organization_assignments_organization_user_unique";--> statement-breakpoint
-- Rename foreign keys
ALTER TABLE "organization_assignments" RENAME CONSTRAINT "organization_members_organization_id_organizations_id_fk" TO "organization_assignments_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "organization_assignments" RENAME CONSTRAINT "organization_members_user_id_users_id_fk" TO "organization_assignments_user_id_users_id_fk";--> statement-breakpoint
-- Rename indexes
ALTER INDEX "organization_members_org_id_idx" RENAME TO "organization_assignments_organization_id_idx";--> statement-breakpoint
ALTER INDEX "organization_members_user_id_idx" RENAME TO "organization_assignments_user_id_idx";
