ALTER TABLE "configurations" RENAME TO "organization_configurations";--> statement-breakpoint
ALTER TABLE "organization_configurations" RENAME CONSTRAINT "configurations_organization_id_organizations_id_fk" TO "organization_configurations_organization_id_organizations_id_fk";
