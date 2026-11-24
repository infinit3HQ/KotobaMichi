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
import july2026N2 from './keys/n2-2026-07.json';
import december2025N2 from './keys/n2-2025-12.json';
import july2025N2 from './keys/n2-2025-07.json';
import december2024N2 from './keys/n2-2024-12.json';
import july2024N2 from './keys/n2-2024-07.json';
import december2023N2 from './keys/n2-2023-12.json';
import july2023N2 from './keys/n2-2023-07.json';
import december2022N2 from './keys/n2-2022-12.json';
import july2022N2 from './keys/n2-2022-07.json';
import december2021N2 from './keys/n2-2021-12.json';
import july2021N2 from './keys/n2-2021-07.json';
import december2020N2 from './keys/n2-2020-12.json';
import december2019N2 from './keys/n2-2019-12.json';
import july2019N2 from './keys/n2-2019-07.json';
import december2018N2 from './keys/n2-2018-12.json';
import july2018N2 from './keys/n2-2018-07.json';
import december2017N2 from './keys/n2-2017-12.json';
import july2017N2 from './keys/n2-2017-07.json';
import december2016N2 from './keys/n2-2016-12.json';
import july2016N2 from './keys/n2-2016-07.json';
import december2015N2 from './keys/n2-2015-12.json';
import july2015N2 from './keys/n2-2015-07.json';
import december2014N2 from './keys/n2-2014-12.json';
import july2014N2 from './keys/n2-2014-07.json';
import december2013N2 from './keys/n2-2013-12.json';
import july2013N2 from './keys/n2-2013-07.json';
import december2012N2 from './keys/n2-2012-12.json';
import july2012N2 from './keys/n2-2012-07.json';
import december2011N2 from './keys/n2-2011-12.json';
import july2011N2 from './keys/n2-2011-07.json';
import december2010N2 from './keys/n2-2010-12.json';
import july2010N2 from './keys/n2-2010-07.json';
import july2026N1 from './keys/n1-2026-07.json';
import december2025N1 from './keys/n1-2025-12.json';
import july2025N1 from './keys/n1-2025-07.json';
import december2024N1 from './keys/n1-2024-12.json';
import july2024N1 from './keys/n1-2024-07.json';
import december2023N1 from './keys/n1-2023-12.json';
import july2023N1 from './keys/n1-2023-07.json';
import december2022N1 from './keys/n1-2022-12.json';
import july2022N1 from './keys/n1-2022-07.json';
import december2021N1 from './keys/n1-2021-12.json';
import july2021N1 from './keys/n1-2021-07.json';
import december2020N1 from './keys/n1-2020-12.json';
import december2019N1 from './keys/n1-2019-12.json';
import july2019N1 from './keys/n1-2019-07.json';
import december2018N1 from './keys/n1-2018-12.json';
import july2018N1 from './keys/n1-2018-07.json';
import december2017N1 from './keys/n1-2017-12.json';
import july2017N1 from './keys/n1-2017-07.json';
import december2016N1 from './keys/n1-2016-12.json';
import july2016N1 from './keys/n1-2016-07.json';
import december2015N1 from './keys/n1-2015-12.json';
import july2015N1 from './keys/n1-2015-07.json';
import december2014N1 from './keys/n1-2014-12.json';
import july2014N1 from './keys/n1-2014-07.json';
import december2013N1 from './keys/n1-2013-12.json';
import july2013N1 from './keys/n1-2013-07.json';
import december2012N1 from './keys/n1-2012-12.json';
import july2012N1 from './keys/n1-2012-07.json';
import december2011N1 from './keys/n1-2011-12.json';
import july2011N1 from './keys/n1-2011-07.json';
import december2010N1 from './keys/n1-2010-12.json';
import july2010N1 from './keys/n1-2010-07.json';
import { SaveMockAttemptDto } from './dto/save-mock-attempt.dto';
import { completedSectionsFor, MOCK_SECTION_IDS } from './sections';

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
	'n2-2026-07': july2026N2,
	'n2-2025-12': december2025N2,
	'n2-2025-07': july2025N2,
	'n2-2024-12': december2024N2,
	'n2-2024-07': july2024N2,
	'n2-2023-12': december2023N2,
	'n2-2023-07': july2023N2,
	'n2-2022-12': december2022N2,
	'n2-2022-07': july2022N2,
	'n2-2021-12': december2021N2,
	'n2-2021-07': july2021N2,
	'n2-2020-12': december2020N2,
	'n2-2019-12': december2019N2,
	'n2-2019-07': july2019N2,
	'n2-2018-12': december2018N2,
	'n2-2018-07': july2018N2,
	'n2-2017-12': december2017N2,
	'n2-2017-07': july2017N2,
	'n2-2016-12': december2016N2,
	'n2-2016-07': july2016N2,
	'n2-2015-12': december2015N2,
	'n2-2015-07': july2015N2,
	'n2-2014-12': december2014N2,
	'n2-2014-07': july2014N2,
	'n2-2013-12': december2013N2,
	'n2-2013-07': july2013N2,
	'n2-2012-12': december2012N2,
	'n2-2012-07': july2012N2,
	'n2-2011-12': december2011N2,
	'n2-2011-07': july2011N2,
	'n2-2010-12': december2010N2,
	'n2-2010-07': july2010N2,
	'n1-2026-07': july2026N1,
	'n1-2025-12': december2025N1,
	'n1-2025-07': july2025N1,
	'n1-2024-12': december2024N1,
	'n1-2024-07': july2024N1,
	'n1-2023-12': december2023N1,
	'n1-2023-07': july2023N1,
	'n1-2022-12': december2022N1,
	'n1-2022-07': july2022N1,
	'n1-2021-12': december2021N1,
	'n1-2021-07': july2021N1,
	'n1-2020-12': december2020N1,
	'n1-2019-12': december2019N1,
	'n1-2019-07': july2019N1,
	'n1-2018-12': december2018N1,
	'n1-2018-07': july2018N1,
	'n1-2017-12': december2017N1,
	'n1-2017-07': july2017N1,
	'n1-2016-12': december2016N1,
	'n1-2016-07': july2016N1,
	'n1-2015-12': december2015N1,
	'n1-2015-07': july2015N1,
	'n1-2014-12': december2014N1,
	'n1-2014-07': july2014N1,
	'n1-2013-12': december2013N1,
	'n1-2013-07': july2013N1,
	'n1-2012-12': december2012N1,
	'n1-2012-07': july2012N1,
	'n1-2011-12': december2011N1,
	'n1-2011-07': july2011N1,
	'n1-2010-12': december2010N1,
	'n1-2010-07': july2010N1,
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
			scores: row.scores ?? null,
			finishedAt: row.finishedAt ? row.finishedAt.getTime() : null,
		};
	}
}
