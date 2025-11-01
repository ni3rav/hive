CREATE TABLE "post_tags" (
	"post_id" uuid NOT NULL,
	"tag_slug" varchar(50) NOT NULL,
	"workspace_id" uuid NOT NULL,
	CONSTRAINT "post_tags_pk" PRIMARY KEY("post_id","tag_slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"workspace_id" uuid NOT NULL,
	"name" varchar(30) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_pk" PRIMARY KEY("slug","workspace_id")
);
--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_post_tags_post_id" ON "post_tags" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_tags_tag" ON "post_tags" USING btree ("tag_slug","workspace_id");--> statement-breakpoint
CREATE INDEX "idx_tags_workspace_id" ON "tags" USING btree ("workspace_id");