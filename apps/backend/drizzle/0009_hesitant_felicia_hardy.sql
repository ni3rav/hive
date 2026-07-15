CREATE TABLE "categories" (
	"workspace_id" uuid NOT NULL,
	"name" varchar(30) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_pk" PRIMARY KEY("slug","workspace_id")
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_workspace_id" ON "categories" USING btree ("workspace_id");--> statement-breakpoint
ALTER TABLE "posts" RENAME COLUMN "category" TO "category_slug_temp";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "category_slug" varchar(255);--> statement-breakpoint
UPDATE "posts" SET "category_slug" = "category_slug_temp"[1];--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "category_slug_temp";--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "fk_post_category" FOREIGN KEY ("category_slug","workspace_id") REFERENCES "public"."categories"("slug","workspace_id") ON DELETE set null ON UPDATE no action;