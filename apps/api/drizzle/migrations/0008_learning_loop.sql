-- Goals, streak freezes and email nudges on learner_state. Every new column
-- has a default or is nullable, so existing learners keep working without a backfill.
ALTER TABLE "learner_state" ADD COLUMN IF NOT EXISTS "streak_freezes" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "learner_state" ADD COLUMN IF NOT EXISTS "target_level" varchar(8);
--> statement-breakpoint
ALTER TABLE "learner_state" ADD COLUMN IF NOT EXISTS "exam_date" date;
--> statement-breakpoint
ALTER TABLE "learner_state" ADD COLUMN IF NOT EXISTS "daily_goal" integer DEFAULT 20 NOT NULL;
--> statement-breakpoint
ALTER TABLE "learner_state" ADD COLUMN IF NOT EXISTS "reminders_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "learner_state" ADD COLUMN IF NOT EXISTS "reminder_hour" smallint DEFAULT 19 NOT NULL;
--> statement-breakpoint
ALTER TABLE "learner_state" ADD COLUMN IF NOT EXISTS "weekly_recap" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "learner_state" ADD COLUMN IF NOT EXISTS "tz_offset_minutes" smallint DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "learner_state" ADD COLUMN IF NOT EXISTS "last_reminded_on" date;
--> statement-breakpoint
ALTER TABLE "learner_state" ADD COLUMN IF NOT EXISTS "last_recap_on" date;
