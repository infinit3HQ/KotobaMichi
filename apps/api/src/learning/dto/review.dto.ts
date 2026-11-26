import { GRADES, type Grade } from '@kotobamichi/srs';
import { Type } from 'class-transformer';
import {
	ArrayMaxSize,
	IsArray,
	IsBoolean,
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	Matches,
	Max,
	MaxLength,
	Min,
	ValidateNested,
} from 'class-validator';

export const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type Level = (typeof LEVELS)[number];
/** `word` cards come from the vocabulary decks, `mock` cards from missed exam questions. */
export const CARD_KINDS = ['word', 'mock'] as const;
export type CardKind = (typeof CARD_KINDS)[number];
export const MAX_BATCH_REVIEWS = 500;

export class ReviewDto {
	@IsString()
	@MaxLength(128)
	itemKey: string;

	@IsIn(LEVELS)
	level: (typeof LEVELS)[number];

	@IsIn(GRADES)
	grade: Grade;

	@IsOptional()
	@IsIn(CARD_KINDS)
	kind?: CardKind;

	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	day: string;
}

export class SavePlaceDto {
	@IsIn(LEVELS)
	level: (typeof LEVELS)[number];

	@IsIn([
		'sprint',
		'grammar',
		'kanji',
		'listening',
		'reading',
		'kana',
		'flashcard',
	])
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
	/** Required for word decks. Mistake cards span every level, so it is optional there. */
	@IsOptional()
	@IsIn(LEVELS)
	level?: Level;

	@IsOptional()
	@IsIn(CARD_KINDS)
	kind?: CardKind;
}

export class SaveGoalDto {
	/** Null clears the goal. */
	@IsOptional()
	@IsIn(LEVELS)
	targetLevel?: Level | null;

	@IsOptional()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	examDate?: string | null;

	@IsOptional()
	@IsInt()
	@Min(5)
	@Max(200)
	dailyGoal?: number;

	@IsOptional()
	@IsBoolean()
	remindersEnabled?: boolean;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(23)
	reminderHour?: number;

	@IsOptional()
	@IsBoolean()
	weeklyRecap?: boolean;

	/** Minutes to add to UTC for the learner's local time, e.g. 330 for Sri Lanka. */
	@IsOptional()
	@IsInt()
	@Min(-720)
	@Max(840)
	tzOffsetMinutes?: number;
}

/** A review made while signed out, replayed on the server after sign-in. */
export class GuestReviewDto extends ReviewDto {
	/** When the review happened, in epoch milliseconds. */
	@IsInt()
	@Min(0)
	reviewedAt: number;
}

export class ReviewBatchDto {
	@IsArray()
	@ArrayMaxSize(MAX_BATCH_REVIEWS)
	@ValidateNested({ each: true })
	@Type(() => GuestReviewDto)
	reviews: GuestReviewDto[];
}
