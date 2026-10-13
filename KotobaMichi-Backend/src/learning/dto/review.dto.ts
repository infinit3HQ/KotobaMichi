import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
const GRADES = ['again', 'hard', 'good', 'easy'] as const;

export class ReviewDto {
	@IsString()
	@MaxLength(128)
	itemKey: string;

	@IsIn(LEVELS)
	level: (typeof LEVELS)[number];

	@IsIn(GRADES)
	grade: (typeof GRADES)[number];

	@IsOptional()
	@IsIn(['word'])
	kind?: 'word';

	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	day: string;
}

export class SavePlaceDto {
	@IsIn(LEVELS)
	level: (typeof LEVELS)[number];

	@IsIn(['sprint', 'grammar', 'kanji', 'listening', 'reading', 'kana', 'flashcard'])
	mode: string;

	@IsOptional()
	@IsString()
	@MaxLength(128)
	itemKey?: string;

	@IsInt()
	@Min(0)
	@Max(20000)
	cursor: number;
}

export class QueueQueryDto {
	@IsIn(LEVELS)
	level: (typeof LEVELS)[number];
}
