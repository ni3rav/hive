ALTER TABLE "authors" RENAME COLUMN "user_id" TO "workspace_id";--> statement-breakpoint
ALTER TABLE "authors" DROP CONSTRAINT "authors_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "idx_authors_user_id";--> statement-breakpoint
ALTER TABLE "authors" ADD CONSTRAINT "authors_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_authors_workspace_id" ON "authors" USING btree ("workspace_id");