CREATE INDEX "idx_authors_user_id" ON "authors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_expires_id" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "users" USING btree ("email");