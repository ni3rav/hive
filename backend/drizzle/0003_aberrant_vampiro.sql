ALTER TABLE "workspaces" ALTER COLUMN "name" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "slug" varchar(35) NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_slug_unique" UNIQUE("slug");