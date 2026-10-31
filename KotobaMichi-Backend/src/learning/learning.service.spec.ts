import type { DbService } from '@/db/drizzle.service';
import { LearningService } from './learning.service';
import type { GuestReviewDto } from './dto/review.dto';

type Row = Record<string, unknown> & { id: string; itemKey: string };

/**
 * Just enough of the Drizzle surface the review path touches.
 * One user, so findFirst ignores the where clause beyond the item key we track.
 */
function fakeDb() {
	const cards = new Map<string, Row>();
	let state: Record<string, unknown> | null = null;
	let pendingKey: string | null = null;

	const db = {
		query: {
			learnerCards: {
				findFirst: jest.fn(() =>
					Promise.resolve(pendingKey ? cards.get(pendingKey) : undefined)
				),
			},
			learnerState: {
				findFirst: jest.fn(() => Promise.resolve(state ?? undefined)),
			},
		},
		insert: jest.fn(() => ({
			values: (values: Record<string, unknown>) => {
				if ('itemKey' in values) {
					cards.set(values['itemKey'] as string, values as Row);
				} else {
					state = { ...values };
				}
				return Promise.resolve();
			},
		})),
		update: jest.fn(() => ({
			set: (values: Record<string, unknown>) => ({
				where: () => {
					if ('streakDays' in values && !('mastery' in values)) {
						state = { ...(state ?? {}), ...values };
					} else if (pendingKey) {
						const row = cards.get(pendingKey);
						if (row) cards.set(pendingKey, { ...row, ...values });
					}
					return Promise.resolve();
				},
			}),
		})),
	};

	const service = new LearningService({ db } as unknown as DbService);
	// Route each findFirst on learner_cards to the item being reviewed.
	const original = (
		service as unknown as { applyReview: (...args: unknown[]) => unknown }
	).applyReview.bind(service);
	(
		service as unknown as { applyReview: (...args: unknown[]) => unknown }
	).applyReview = (userId: unknown, dto: unknown, at: unknown) => {
		pendingKey = (dto as { itemKey: string }).itemKey;
		return original(userId, dto, at);
	};

	return { service, cards, getState: () => state };
}

const DAY = 86_400_000;

function review(
	itemKey: string,
	reviewedAt: number,
	day: string,
	grade: GuestReviewDto['grade'] = 'good'
): GuestReviewDto {
	return { itemKey, level: 'N5', grade, day, reviewedAt };
}

describe('LearningService.reviewBatch', () => {
	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(new Date('2026-10-30T12:00:00Z'));
	});
	afterEach(() => {
		jest.useRealTimers();
	});

	it('replays reviews oldest first and counts the streak across days', async () => {
		const { service, cards, getState } = fakeDb();
		const now = Date.now();
		const result = await service.reviewBatch('user-1', {
			reviews: [
				review('w-2', now - 1 * DAY, '2026-10-29'),
				review('w-1', now - 2 * DAY, '2026-10-28'),
				review('w-1', now - 1 * DAY + 1000, '2026-10-29'),
			],
		});
		expect(result).toEqual({ applied: 3, skipped: 0, streak: 2 });
		expect(cards.get('w-1')?.['reps']).toBe(2);
		expect(cards.get('w-2')?.['reps']).toBe(1);
		expect(getState()?.['lastActiveOn']).toBe('2026-10-29');
	});

	it('skips reviews from the future or outside the sync window', async () => {
		const { service, cards } = fakeDb();
		const now = Date.now();
		const result = await service.reviewBatch('user-1', {
			reviews: [
				review('w-1', now + DAY, '2026-10-31'),
				review('w-2', now - 400 * DAY, '2025-09-25'),
			],
		});
		expect(result.applied).toBe(0);
		expect(result.skipped).toBe(2);
		expect(cards.size).toBe(0);
	});

	it('does not rewind a card that has a newer server review', async () => {
		const { service, cards } = fakeDb();
		const now = Date.now();
		await service.review('user-1', {
			itemKey: 'w-1',
			level: 'N5',
			grade: 'good',
			day: '2026-10-30',
		});
		const before = cards.get('w-1');
		const result = await service.reviewBatch('user-1', {
			reviews: [review('w-1', now - DAY, '2026-10-29', 'again')],
		});
		expect(result).toEqual({ applied: 0, skipped: 1, streak: null });
		expect(cards.get('w-1')).toEqual(before);
	});

	it('does not reset a live streak when older guest days sync in', async () => {
		const { service, getState } = fakeDb();
		const now = Date.now();
		await service.review('user-1', {
			itemKey: 'w-1',
			level: 'N5',
			grade: 'good',
			day: '2026-10-30',
		});
		expect(getState()?.['lastActiveOn']).toBe('2026-10-30');
		await service.reviewBatch('user-1', {
			reviews: [review('w-9', now - 5 * DAY, '2026-10-25')],
		});
		expect(getState()?.['lastActiveOn']).toBe('2026-10-30');
		expect(getState()?.['streakDays']).toBe(1);
	});
});
