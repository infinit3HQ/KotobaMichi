-- A sitting is either strict (the real exam clock, audio once) or practice
-- (the clock can pause, audio has controls). Existing sittings were all strict.
-- paused_at is set while a practice section's clock is paused.
ALTER TABLE "mock_exam_attempts" ADD COLUMN IF NOT EXISTS "mode" varchar(16) DEFAULT 'strict' NOT NULL;
--> statement-breakpoint
ALTER TABLE "mock_exam_attempts" ADD COLUMN IF NOT EXISTS "paused_at" timestamp;
