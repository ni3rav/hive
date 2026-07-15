ALTER TABLE "posts" ALTER COLUMN "excerpt" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "excerpt" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "published_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "post_content" ADD COLUMN "content_html" text NOT NULL;--> statement-breakpoint
ALTER TABLE "post_content" ADD COLUMN "content_json" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "status" varchar(20) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_content" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "tags";