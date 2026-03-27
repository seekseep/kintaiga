DROP INDEX "activities_user_id_idx";--> statement-breakpoint
DROP INDEX "activities_project_id_idx";--> statement-breakpoint
CREATE INDEX "activities_project_started_idx" ON "activities" USING btree ("project_id","started_at");