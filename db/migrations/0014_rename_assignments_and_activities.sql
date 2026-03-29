-- Rename table: assignments -> project_assignments
ALTER TABLE "assignments" RENAME TO "project_assignments";--> statement-breakpoint
-- Rename foreign keys
ALTER TABLE "project_assignments" RENAME CONSTRAINT "assignments_project_id_projects_id_fk" TO "project_assignments_project_id_projects_id_fk";--> statement-breakpoint
ALTER TABLE "project_assignments" RENAME CONSTRAINT "assignments_user_id_users_id_fk" TO "project_assignments_user_id_users_id_fk";--> statement-breakpoint
-- Rename indexes
ALTER INDEX "assignments_project_id_idx" RENAME TO "project_assignments_project_id_idx";--> statement-breakpoint
ALTER INDEX "assignments_user_id_idx" RENAME TO "project_assignments_user_id_idx";--> statement-breakpoint
-- Rename table: activities -> project_activities
ALTER TABLE "activities" RENAME TO "project_activities";--> statement-breakpoint
-- Rename foreign keys
ALTER TABLE "project_activities" RENAME CONSTRAINT "activities_user_id_users_id_fk" TO "project_activities_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "project_activities" RENAME CONSTRAINT "activities_project_id_projects_id_fk" TO "project_activities_project_id_projects_id_fk";--> statement-breakpoint
-- Rename indexes
ALTER INDEX "activities_started_at_idx" RENAME TO "project_activities_started_at_idx";--> statement-breakpoint
ALTER INDEX "activities_user_started_idx" RENAME TO "project_activities_user_started_idx";--> statement-breakpoint
ALTER INDEX "activities_project_started_idx" RENAME TO "project_activities_project_started_idx";--> statement-breakpoint
-- Rename table: deleted_assignments -> deleted_project_assignments
ALTER TABLE "deleted_assignments" RENAME TO "deleted_project_assignments";--> statement-breakpoint
-- Rename table: deleted_activities -> deleted_project_activities
ALTER TABLE "deleted_activities" RENAME TO "deleted_project_activities";
