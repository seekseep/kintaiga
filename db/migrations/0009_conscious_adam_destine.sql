ALTER TABLE "users" ADD COLUMN "email" varchar(255);--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");