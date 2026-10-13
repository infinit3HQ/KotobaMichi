CREATE TABLE IF NOT EXISTS "learner_cards" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"item_key" text NOT NULL,
	"kind" varchar(16) DEFAULT 'word' NOT NULL,
	"level" varchar(8) NOT NULL,
	"mastery" integer DEFAULT 0 NOT NULL,
	"ease" real DEFAULT 2.5 NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"last_grade" varchar(8),
	"learned_at" timestamp,
	"last_seen_at" timestamp,
	"last_seen_day" varchar(10),
	"next_review_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "learner_state" (
	"user_id" varchar(128) PRIMARY KEY NOT NULL,
	"level" varchar(8) DEFAULT 'N5' NOT NULL,
	"mode" varchar(24) DEFAULT 'flashcard' NOT NULL,
	"item_key" text,
	"cursor_index" integer DEFAULT 0 NOT NULL,
	"bookmarks" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"last_active_on" date,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "learner_cards" ADD CONSTRAINT "learner_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "learner_state" ADD CONSTRAINT "learner_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "learner_cards_user_item_unique" ON "learner_cards" USING btree ("user_id","item_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learner_cards_user_level_idx" ON "learner_cards" USING btree ("user_id","level");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learner_cards_due_idx" ON "learner_cards" USING btree ("user_id","next_review_at");
