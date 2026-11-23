import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SaveMockAttemptDto } from './dto/save-mock-attempt.dto';
import { completedSectionsFor, MOCK_SECTION_IDS } from './sections';

describe('completedSectionsFor', () => {
	it('keeps known section ids once, in paper order', () => {
		expect(
			completedSectionsFor(
				['listening', 'vocabulary', 'listening', 'kanji'],
				-1,
				false
			)
		).toEqual(['vocabulary', 'listening']);
	});

	it('reads an older in-order client as every section before its index being done', () => {
		expect(completedSectionsFor(undefined, 2, false)).toEqual([
			'vocabulary',
			'grammar-reading',
		]);
		expect(completedSectionsFor(undefined, 0, false)).toEqual([]);
	});

	it('treats an older finished sitting as every section done', () => {
		expect(completedSectionsFor(undefined, 2, true)).toEqual([
			...MOCK_SECTION_IDS,
		]);
	});
});

describe('SaveMockAttemptDto', () => {
	const errorsFor = async (body: object) =>
		(await validate(plainToInstance(SaveMockAttemptDto, body))).map(
			error => error.property
		);

	const base = { sectionStartedAt: Date.now(), answers: {} };

	it('accepts the menu position and a list of finished sections', async () => {
		expect(
			await errorsFor({
				...base,
				sectionIndex: -1,
				completedSections: ['listening'],
			})
		).toEqual([]);
	});

	it('still accepts older clients that send no section list', async () => {
		expect(await errorsFor({ ...base, sectionIndex: 1 })).toEqual([]);
	});

	it('accepts an N2 language-and-reading section', async () => {
		expect(
			await errorsFor({
				...base,
				sectionIndex: 0,
				completedSections: ['language-reading'],
			})
		).toEqual([]);
	});

	it('rejects unknown section ids and positions below the menu', async () => {
		expect(
			await errorsFor({
				...base,
				sectionIndex: -2,
				completedSections: ['kanji'],
			})
		).toEqual(['sectionIndex', 'completedSections']);
	});
});
