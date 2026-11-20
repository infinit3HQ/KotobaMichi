-- Mock exam sections can now be taken in any order, so each sitting records which
-- sections it has closed. Existing sittings went in order: finished ones took all three,
-- open ones closed every section before their section_index.
ALTER TABLE "mock_exam_attempts" ADD COLUMN IF NOT EXISTS "completed_sections" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
UPDATE "mock_exam_attempts"
SET "completed_sections" = CASE
	WHEN "status" = 'finished' THEN '["vocabulary","grammar-reading","listening"]'::jsonb
	WHEN "section_index" >= 2 THEN '["vocabulary","grammar-reading"]'::jsonb
	WHEN "section_index" = 1 THEN '["vocabulary"]'::jsonb
	ELSE '[]'::jsonb
END
WHERE "completed_sections" = '[]'::jsonb;
