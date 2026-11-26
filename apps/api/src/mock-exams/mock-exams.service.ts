import { BadRequestException, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { DbService } from '@/db/drizzle.service';
import { mockExamAttempts, type MockExamScore } from '@/db/schema';
import { LearningService } from '@/learning/learning.service';
import { ANSWER_KEYS, levelOfExam } from './answer-keys';
import { missedQuestions, mistakeKey } from './mistakes';
import { SaveMockAttemptDto } from './dto/save-mock-attempt.dto';
import {
	completedSectionsFor,
	MOCK_SECTION_IDS,
	type MockMode,
} from './sections';

type AttemptRow = typeof mockExamAttempts.$inferSelect;

@Injectable()
export class MockExamsService {
	constructor(
		private readonly drizzle: DbService,
		private readonly learning: LearningService
	) {}

	/**
	 * Turns the questions missed on the learner's latest finished sitting
	 * of this exam into review cards that are due straight away.
	 */
	async addMistakes(userId: string, examId: string) {
		this.assertExam(examId);
		const level = levelOfExam(examId);
		if (!level) throw new BadRequestException('Unknown mock exam level');
		const [attempt] = await this.drizzle.db
			.select()
			.from(mockExamAttempts)
			.where(
				and(
					eq(mockExamAttempts.userId, userId),
					eq(mockExamAttempts.examId, examId),
					eq(mockExamAttempts.status, 'finished')
				)
			)
			.orderBy(desc(mockExamAttempts.finishedAt))
			.limit(1);
		if (!attempt) {
			throw new BadRequestException('Finish this exam before adding mistakes');
		}
		const missed = missedQuestions(
			ANSWER_KEYS[examId] ?? {},
			attempt.answers ?? {},
			attempt.completedSections ?? []
		);
		const result = await this.learning.addCards(
			userId,
			missed.map(questionKey => ({
				itemKey: mistakeKey(examId, questionKey),
				level,
				kind: 'mock' as const,
			}))
		);
		return { ...result, missed: missed.length };
	}

	async list(userId: string) {
		const rows = await this.drizzle.db
			.select()
			.from(mockExamAttempts)
			.where(eq(mockExamAttempts.userId, userId))
			.orderBy(desc(mockExamAttempts.createdAt));
		return rows.map(row => this.present(row));
	}

	async forExam(userId: string, examId: string) {
		this.assertExam(examId);
		const rows = await this.drizzle.db
			.select()
			.from(mockExamAttempts)
			.where(
				and(
					eq(mockExamAttempts.userId, userId),
					eq(mockExamAttempts.examId, examId)
				)
			)
			.orderBy(desc(mockExamAttempts.createdAt));
		const current = rows.find(row => row.status === 'in_progress') ?? null;
		return {
			current: current ? this.present(current) : null,
			history: rows
				.filter(row => row.status === 'finished')
				.map(row => this.present(row)),
		};
	}

	async save(userId: string, examId: string, dto: SaveMockAttemptDto) {
		const answers = this.cleanAnswers(examId, dto.answers);
		const started = this.startedAt(dto.sectionStartedAt);
		const timing = this.timing(dto);
		const completedSections = completedSectionsFor(
			dto.completedSections,
			dto.sectionIndex,
			false,
			this.sectionOrder(examId)
		);
		const existing = await this.openAttempt(userId, examId);
		if (existing) {
			const [row] = await this.drizzle.db
				.update(mockExamAttempts)
				.set({
					sectionIndex: dto.sectionIndex,
					sectionStartedAt: started,
					...timing,
					completedSections,
					answers,
					updatedAt: new Date(),
				})
				.where(eq(mockExamAttempts.id, existing.id))
				.returning();
			if (!row) throw new BadRequestException('Could not save the sitting');
			return this.present(row);
		}
		const [row] = await this.drizzle.db
			.insert(mockExamAttempts)
			.values({
				id: uuidv7(),
				userId,
				examId,
				status: 'in_progress',
				sectionIndex: dto.sectionIndex,
				sectionStartedAt: started,
				...timing,
				completedSections,
				answers,
			})
			.returning();
		if (!row) throw new BadRequestException('Could not save the sitting');
		return this.present(row);
	}

	async finish(userId: string, examId: string, dto: SaveMockAttemptDto) {
		const answers = this.cleanAnswers(examId, dto.answers);
		const scores = this.score(examId, answers);
		const started = this.startedAt(dto.sectionStartedAt);
		const timing = { ...this.timing(dto), pausedAt: null };
		const completedSections = completedSectionsFor(
			dto.completedSections,
			dto.sectionIndex,
			true,
			this.sectionOrder(examId)
		);
		const existing = await this.openAttempt(userId, examId);
		const finishedAt = new Date();
		if (existing) {
			const [row] = await this.drizzle.db
				.update(mockExamAttempts)
				.set({
					status: 'finished',
					sectionIndex: dto.sectionIndex,
					sectionStartedAt: started,
					...timing,
					completedSections,
					answers,
					scores,
					finishedAt,
					updatedAt: finishedAt,
				})
				.where(eq(mockExamAttempts.id, existing.id))
				.returning();
			if (!row) throw new BadRequestException('Could not save the sitting');
			return this.present(row);
		}
		const [row] = await this.drizzle.db
			.insert(mockExamAttempts)
			.values({
				id: uuidv7(),
				userId,
				examId,
				status: 'finished',
				sectionIndex: dto.sectionIndex,
				sectionStartedAt: started,
				...timing,
				completedSections,
				answers,
				scores,
				finishedAt,
			})
			.returning();
		if (!row) throw new BadRequestException('Could not save the sitting');
		return this.present(row);
	}

	private async openAttempt(userId: string, examId: string) {
		this.assertExam(examId);
		const [row] = await this.drizzle.db
			.select()
			.from(mockExamAttempts)
			.where(
				and(
					eq(mockExamAttempts.userId, userId),
					eq(mockExamAttempts.examId, examId),
					eq(mockExamAttempts.status, 'in_progress')
				)
			)
			.limit(1);
		return row ?? null;
	}

	/** Section ids in the order the answer key was written, which is paper order. */
	private sectionOrder(examId: string): string[] {
		const ids: string[] = [];
		for (const name of Object.keys(ANSWER_KEYS[examId] ?? {})) {
			const id = name.split(':')[0] ?? '';
			if (id && !ids.includes(id)) ids.push(id);
		}
		return ids.length ? ids : [...MOCK_SECTION_IDS];
	}

	private assertExam(examId: string) {
		if (!ANSWER_KEYS[examId]) {
			throw new BadRequestException('Unknown mock exam');
		}
	}

	private startedAt(value: number) {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			throw new BadRequestException('Invalid section start');
		}
		return date;
	}

	/** Strict sittings never pause, so a stray pausedAt from a client is dropped. */
	private timing(dto: SaveMockAttemptDto): {
		mode: MockMode;
		pausedAt: Date | null;
	} {
		const mode: MockMode = dto.mode ?? 'strict';
		if (mode === 'strict' || dto.pausedAt == null) {
			return { mode, pausedAt: null };
		}
		return { mode, pausedAt: this.startedAt(dto.pausedAt) };
	}

	private cleanAnswers(examId: string, raw: Record<string, number>) {
		this.assertExam(examId);
		const key = ANSWER_KEYS[examId] ?? {};
		const answers: Record<string, number> = {};
		const entries = Object.entries(raw ?? {});
		if (entries.length > 400) {
			throw new BadRequestException('Too many answers');
		}
		for (const [name, value] of entries) {
			if (key[name] == null) continue;
			const choice = Number(value);
			if (!Number.isInteger(choice) || choice < 1 || choice > 4) continue;
			answers[name] = choice;
		}
		return answers;
	}

	private score(
		examId: string,
		answers: Record<string, number>
	): MockExamScore[] {
		const key = ANSWER_KEYS[examId] ?? {};
		const buckets: Record<string, MockExamScore> = {
			language: { id: 'language', title: '言語知識', correct: 0, total: 0 },
			reading: { id: 'reading', title: '読解', correct: 0, total: 0 },
			listening: { id: 'listening', title: '聴解', correct: 0, total: 0 },
		};
		for (const [name, answer] of Object.entries(key)) {
			const part = name.split(':')[1] ?? '';
			const bucketId =
				part === 'reading' || part === 'listening' ? part : 'language';
			const bucket = buckets[bucketId];
			if (!bucket) continue;
			bucket.total += 1;
			if (answers[name] === answer) bucket.correct += 1;
		}
		return [
			buckets['language'],
			buckets['reading'],
			buckets['listening'],
		].filter((bucket): bucket is MockExamScore => bucket != null);
	}

	private present(row: AttemptRow) {
		return {
			id: row.id,
			examId: row.examId,
			status: row.status,
			sectionIndex: row.sectionIndex,
			sectionStartedAt: row.sectionStartedAt.getTime(),
			answers: row.answers ?? {},
			completedSections: row.completedSections ?? [],
			mode: row.mode === 'practice' ? 'practice' : 'strict',
			pausedAt: row.pausedAt ? row.pausedAt.getTime() : null,
			scores: row.scores ?? null,
			finishedAt: row.finishedAt ? row.finishedAt.getTime() : null,
		};
	}
}
