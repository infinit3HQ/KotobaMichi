import {
	type FSRS,
	type Grade as FsrsGrade,
	fsrs,
	generatorParameters,
	Rating,
} from 'ts-fsrs';

/** How the learner rated a review. Sent by the web app, validated by the API. */
export const GRADES = ['again', 'hard', 'good', 'easy'] as const;
export type Grade = (typeof GRADES)[number];

export const RATING: Readonly<Record<Grade, FsrsGrade>> = {
	again: Rating.Again,
	hard: Rating.Hard,
	good: Rating.Good,
	easy: Rating.Easy,
};

/**
 * Guest reviews are replayed in the browser and later synced to the API,
 * so both sides must schedule with exactly these settings.
 * Fuzz spreads due dates so cards learned together don't all come back on the same day.
 */
export const SCHEDULER_PARAMS = Object.freeze({
	enable_fuzz: true,
	request_retention: 0.9,
});

export function createScheduler(): FSRS {
	return fsrs(generatorParameters(SCHEDULER_PARAMS));
}
