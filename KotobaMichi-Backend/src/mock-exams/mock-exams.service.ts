import { BadRequestException, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { DbService } from '@/db/drizzle.service';
import { mockExamAttempts, type MockExamScore } from '@/db/schema';
import n3December2025 from './keys/n3-2025-12.json';
import n3July2025 from './keys/n3-2025-07.json';
import n3December2024 from './keys/n3-2024-12.json';
import n3July2024 from './keys/n3-2024-07.json';
import n3December2023 from './keys/n3-2023-12.json';
import n3July2023 from './keys/n3-2023-07.json';
import n3December2022 from './keys/n3-2022-12.json';
import n3July2022 from './keys/n3-2022-07.json';
import n3December2021 from './keys/n3-2021-12.json';
import n3July2021 from './keys/n3-2021-07.json';
import n3December2020 from './keys/n3-2020-12.json';
import n3December2019 from './keys/n3-2019-12.json';
import n3July2019 from './keys/n3-2019-07.json';
import n3December2018 from './keys/n3-2018-12.json';
import n3July2018 from './keys/n3-2018-07.json';
import n3December2017 from './keys/n3-2017-12.json';
import n3July2017 from './keys/n3-2017-07.json';
import n3December2016 from './keys/n3-2016-12.json';
import n3July2016 from './keys/n3-2016-07.json';
import n3December2015 from './keys/n3-2015-12.json';
import n3July2015 from './keys/n3-2015-07.json';
import n3December2014 from './keys/n3-2014-12.json';
import n3July2014 from './keys/n3-2014-07.json';
import n3December2013 from './keys/n3-2013-12.json';
import n3July2013 from './keys/n3-2013-07.json';
import n3December2012 from './keys/n3-2012-12.json';
import n3July2012 from './keys/n3-2012-07.json';
import n3December2011 from './keys/n3-2011-12.json';
import n3July2011 from './keys/n3-2011-07.json';
import n3July2010 from './keys/n3-2010-07.json';
import { SaveMockAttemptDto } from './dto/save-mock-attempt.dto';

const ANSWER_KEYS: Record<string, Record<string, number>> = {
	'n3-2025-12': n3December2025,
	'n3-2025-07': n3July2025,
	'n3-2024-12': n3December2024,
	'n3-2024-07': n3July2024,
	'n3-2023-12': n3December2023,
	'n3-2023-07': n3July2023,
	'n3-2022-12': n3December2022,
	'n3-2022-07': n3July2022,
	'n3-2021-12': n3December2021,
	'n3-2021-07': n3July2021,
	'n3-2020-12': n3December2020,
	'n3-2019-12': n3December2019,
	'n3-2019-07': n3July2019,
	'n3-2018-12': n3December2018,
	'n3-2018-07': n3July2018,
	'n3-2017-12': n3December2017,
	'n3-2017-07': n3July2017,
	'n3-2016-12': n3December2016,
	'n3-2016-07': n3July2016,
	'n3-2015-12': n3December2015,
	'n3-2015-07': n3July2015,
	'n3-2014-12': n3December2014,
	'n3-2014-07': n3July2014,
	'n3-2013-12': n3December2013,
	'n3-2013-07': n3July2013,
	'n3-2012-12': n3December2012,
	'n3-2012-07': n3July2012,
	'n3-2011-12': n3December2011,
	'n3-2011-07': n3July2011,
	'n3-2010-07': n3July2010,
};

type AttemptRow = typeof mockExamAttempts.$inferSelect;

@Injectable()
export class MockExamsService {
	constructor(private readonly drizzle: DbService) {}

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
		const existing = await this.openAttempt(userId, examId);
		if (existing) {
			const [row] = await this.drizzle.db
				.update(mockExamAttempts)
				.set({
					sectionIndex: dto.sectionIndex,
					sectionStartedAt: started,
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
		const existing = await this.openAttempt(userId, examId);
		const finishedAt = new Date();
		if (existing) {
			const [row] = await this.drizzle.db
				.update(mockExamAttempts)
				.set({
					status: 'finished',
					sectionIndex: dto.sectionIndex,
					sectionStartedAt: started,
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

	private score(examId: string, answers: Record<string, number>): MockExamScore[] {
		const key = ANSWER_KEYS[examId] ?? {};
		const buckets: Record<string, MockExamScore> = {
			language: { id: 'language', title: '言語知識', correct: 0, total: 0 },
			reading: { id: 'reading', title: '読解', correct: 0, total: 0 },
			listening: { id: 'listening', title: '聴解', correct: 0, total: 0 },
		};
		for (const [name, answer] of Object.entries(key)) {
			const part = name.split(':')[1] ?? '';
			const bucketId = part === 'reading' || part === 'listening' ? part : 'language';
			const bucket = buckets[bucketId];
			if (!bucket) continue;
			bucket.total += 1;
			if (answers[name] === answer) bucket.correct += 1;
		}
		return [buckets['language'], buckets['reading'], buckets['listening']].filter(
			(bucket): bucket is MockExamScore => bucket != null
		);
	}

	private present(row: AttemptRow) {
		return {
			id: row.id,
			examId: row.examId,
			status: row.status,
			sectionIndex: row.sectionIndex,
			sectionStartedAt: row.sectionStartedAt.getTime(),
			answers: row.answers ?? {},
			scores: row.scores ?? null,
			finishedAt: row.finishedAt ? row.finishedAt.getTime() : null,
		};
	}
}
