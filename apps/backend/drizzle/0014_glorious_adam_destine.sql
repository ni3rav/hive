ALTER TABLE "posts" DROP CONSTRAINT "posts_slug_unique";--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_workspace_slug_unique" UNIQUE("workspace_id","slug");