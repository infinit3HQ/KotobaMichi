import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, desc, eq, gte, isNull, lte, ne, or } from 'drizzle-orm';
import { DbService } from '@/db/drizzle.service';
import {
	learnerCards,
	learnerState,
	mockExamAttempts,
	users,
	type MockExamScore,
} from '@/db/schema';
import { EmailService } from '@/email/email.service';
import { shiftDay } from '@/learning/streak';
import { localClock, shouldRecap, shouldRemind } from './nudge-rules';
import { recapEmail, reminderEmail, type RecapStats } from './nudge-templates';

const TICK_MS = 10 * 60_000;
const SECTION_NAMES: Record<string, string> = {
	language: 'vocabulary and grammar',
	reading: 'reading',
	listening: 'listening',
};

type Candidate = Awaited<ReturnType<NudgesService['candidates']>>[number];

/**
 * Sends daily reminders and Sunday recaps by email.
 * Off unless NUDGES_ENABLED=true, so a local server pointed at a shared
 * database never mails real learners.
 */
@Injectable()
export class NudgesService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(NudgesService.name);
	private timer: NodeJS.Timeout | null = null;
	private running = false;

	constructor(
		private readonly drizzle: DbService,
		private readonly email: EmailService,
		private readonly config: ConfigService
	) {}

	onModuleInit() {
		if (this.config.get<string>('NUDGES_ENABLED') !== 'true') return;
		this.timer = setInterval(() => void this.tick(), TICK_MS);
		this.timer.unref();
		this.logger.log('Email nudges are on');
	}

	onModuleDestroy() {
		if (this.timer) clearInterval(this.timer);
	}

	async tick(now = new Date()) {
		if (this.running) return;
		this.running = true;
		try {
			for (const row of await this.candidates()) {
				const clock = localClock(now, row.tzOffsetMinutes);
				if (shouldRemind(row, clock)) await this.remind(row, clock.day);
				if (shouldRecap(row, clock)) await this.recap(row, clock.day);
			}
		} catch (error) {
			this.logger.error(
				'Nudge tick failed',
				error instanceof Error ? error.stack : String(error)
			);
		} finally {
			this.running = false;
		}
	}

	private candidates() {
		return this.drizzle.db
			.select({
				userId: learnerState.userId,
				email: users.email,
				name: users.name,
				remindersEnabled: learnerState.remindersEnabled,
				reminderHour: learnerState.reminderHour,
				weeklyRecap: learnerState.weeklyRecap,
				tzOffsetMinutes: learnerState.tzOffsetMinutes,
				lastActiveOn: learnerState.lastActiveOn,
				lastRemindedOn: learnerState.lastRemindedOn,
				lastRecapOn: learnerState.lastRecapOn,
				streakDays: learnerState.streakDays,
			})
			.from(learnerState)
			.innerJoin(users, eq(users.id, learnerState.userId))
			.where(
				and(
					eq(users.isEmailVerified, true),
					or(
						eq(learnerState.remindersEnabled, true),
						eq(learnerState.weeklyRecap, true)
					)
				)
			);
	}

	/** Marks the day as sent first, so two servers never send the same email. */
	private async claim(
		userId: string,
		column: 'lastRemindedOn' | 'lastRecapOn',
		day: string
	) {
		const rows = await this.drizzle.db
			.update(learnerState)
			.set({ [column]: day })
			.where(
				and(
					eq(learnerState.userId, userId),
					or(isNull(learnerState[column]), ne(learnerState[column], day))
				)
			)
			.returning({ userId: learnerState.userId });
		return rows.length > 0;
	}

	private appUrl(path: string) {
		const base = (this.config.get<string>('APP_URL') ?? '').replace(/\/+$/, '');
		return `${base}${path}`;
	}

	private async remind(row: Candidate, day: string) {
		if (!(await this.claim(row.userId, 'lastRemindedOn', day))) return;
		const dueNow = await this.dueCount(row.userId);
		const mail = reminderEmail({
			name: row.name ?? '',
			streak: row.lastActiveOn === shiftDay(day, -1) ? row.streakDays : 0,
			dueNow,
			practiceUrl: this.appUrl('/'),
			settingsUrl: this.appUrl('/profile#goal'),
		});
		await this.send(row.email, mail);
	}

	private async recap(row: Candidate, day: string) {
		if (!(await this.claim(row.userId, 'lastRecapOn', day))) return;
		const stats = await this.weekStats(row, day);
		const mail = recapEmail({
			name: row.name ?? '',
			stats,
			homeUrl: this.appUrl('/'),
			settingsUrl: this.appUrl('/profile#goal'),
		});
		await this.send(row.email, mail);
	}

	private async send(
		to: string,
		mail: { subject: string; text: string; html: string }
	) {
		try {
			await this.email.sendMail({ to, ...mail });
		} catch (error) {
			this.logger.warn(
				`Nudge email failed: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	private async dueCount(userId: string) {
		const rows = await this.drizzle.db
			.select({ id: learnerCards.id })
			.from(learnerCards)
			.where(
				and(
					eq(learnerCards.userId, userId),
					lte(learnerCards.nextReviewAt, new Date())
				)
			);
		return rows.length;
	}

	private async weekStats(row: Candidate, day: string): Promise<RecapStats> {
		const weekStart = shiftDay(day, -6);
		const since = new Date(Date.now() - 7 * 86_400_000);
		const [cards, attempts, dueNow] = await Promise.all([
			this.drizzle.db
				.select({
					lastSeenDay: learnerCards.lastSeenDay,
					learnedAt: learnerCards.learnedAt,
				})
				.from(learnerCards)
				.where(
					and(
						eq(learnerCards.userId, row.userId),
						gte(learnerCards.lastSeenDay, weekStart)
					)
				),
			this.drizzle.db
				.select({
					examId: mockExamAttempts.examId,
					scores: mockExamAttempts.scores,
				})
				.from(mockExamAttempts)
				.where(
					and(
						eq(mockExamAttempts.userId, row.userId),
						eq(mockExamAttempts.status, 'finished'),
						gte(mockExamAttempts.finishedAt, since)
					)
				)
				.orderBy(desc(mockExamAttempts.finishedAt)),
			this.dueCount(row.userId),
		]);
		return {
			studied: cards.length,
			learned: cards.filter(c => c.learnedAt && c.learnedAt >= since).length,
			dueNow,
			streak: row.streakDays,
			mocks: attempts.map(a => totals(a.examId, a.scores ?? [])),
			weakest: weakestSection(attempts.flatMap(a => a.scores ?? [])),
		};
	}
}

function totals(examId: string, scores: MockExamScore[]) {
	return {
		examId,
		correct: scores.reduce((sum, s) => sum + s.correct, 0),
		total: scores.reduce((sum, s) => sum + s.total, 0),
	};
}

/** The section with the lowest share correct across this week's sittings. */
export function weakestSection(scores: MockExamScore[]) {
	const byId = new Map<string, { correct: number; total: number }>();
	for (const score of scores) {
		const current = byId.get(score.id) ?? { correct: 0, total: 0 };
		byId.set(score.id, {
			correct: current.correct + score.correct,
			total: current.total + score.total,
		});
	}
	const ranked = [...byId.entries()]
		.filter(([, value]) => value.total > 0)
		.sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total);
	const first = ranked[0];
	return first ? (SECTION_NAMES[first[0]] ?? first[0]) : null;
}
