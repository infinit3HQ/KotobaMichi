CREATE TABLE IF NOT EXISTS "mock_exam_attempts" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"exam_id" varchar(64) NOT NULL,
	"status" varchar(16) DEFAULT 'in_progress' NOT NULL,
	"section_index" integer DEFAULT 0 NOT NULL,
	"section_started_at" timestamp NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scores" jsonb,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mock_exam_attempts" ADD CONSTRAINT "mock_exam_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mock_exam_attempts_user_idx" ON "mock_exam_attempts" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "mock_exam_attempts_open_unique" ON "mock_exam_attempts" USING btree ("user_id","exam_id") WHERE status = 'in_progress';
