ALTER TABLE "organizations" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "context" jsonb;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_id_unique" UNIQUE("user_id");