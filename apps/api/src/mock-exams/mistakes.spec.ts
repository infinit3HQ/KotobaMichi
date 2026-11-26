import { MISTAKE_PREFIX, missedQuestions, parseMistakeKey } from './mistakes';

const key = {
	'vocabulary:vocabulary:1:1': 2,
	'vocabulary:vocabulary:1:2': 3,
	'grammar-reading:grammar:1:14': 1,
	'grammar-reading:reading:4:24': 4,
	'listening:listening:1:1': 2,
};

describe('missedQuestions', () => {
	it('keeps wrong and blank language questions from sections the learner took', () => {
		const missed = missedQuestions(
			key,
			{ 'vocabulary:vocabulary:1:1': 2, 'vocabulary:vocabulary:1:2': 1 },
			['vocabulary', 'grammar-reading', 'listening']
		);
		expect(missed).toEqual([
			'vocabulary:vocabulary:1:2',
			'grammar-reading:grammar:1:14',
		]);
	});

	it('leaves out reading and listening, which need a passage or audio', () => {
		const missed = missedQuestions(key, {}, ['grammar-reading', 'listening']);
		expect(missed).toEqual(['grammar-reading:grammar:1:14']);
	});

	it('ignores sections that were never taken', () => {
		expect(missedQuestions(key, {}, ['listening'])).toEqual([]);
	});
});

describe('parseMistakeKey', () => {
	it('splits a card key back into exam and question', () => {
		expect(
			parseMistakeKey(`${MISTAKE_PREFIX}n3-2024-12:vocabulary:vocabulary:1:2`)
		).toEqual({
			examId: 'n3-2024-12',
			questionKey: 'vocabulary:vocabulary:1:2',
		});
	});

	it('rejects keys that are not mistake cards', () => {
		expect(parseMistakeKey('word-123')).toBeNull();
	});
});
