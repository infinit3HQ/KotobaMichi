-- FSRS memory state for study cards. Existing rows keep null stability and
-- difficulty; the scheduler converts them from their SM-2 fields on next review.
ALTER TABLE "learner_cards" ADD COLUMN IF NOT EXISTS "stability" real;
--> statement-breakpoint
ALTER TABLE "learner_cards" ADD COLUMN IF NOT EXISTS "difficulty" real;
--> statement-breakpoint
ALTER TABLE "learner_cards" ADD COLUMN IF NOT EXISTS "fsrs_state" smallint DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "learner_cards" ADD COLUMN IF NOT EXISTS "learning_steps" integer DEFAULT 0 NOT NULL;
