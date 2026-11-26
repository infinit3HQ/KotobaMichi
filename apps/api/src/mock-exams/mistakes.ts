/** Card keys for missed mock questions: `mock:<examId>:<section:part:mondai:item>`. */
export const MISTAKE_PREFIX = 'mock:';

/** Parts that stand on their own as a flashcard. Reading needs a passage, listening needs audio. */
const REVIEWABLE_PARTS = new Set(['vocabulary', 'grammar']);

function partOf(questionKey: string) {
	return questionKey.split(':')[1] ?? '';
}

/**
 * Question keys the learner got wrong or left blank, in paper order,
 * limited to sections they took and to parts that work as flashcards.
 */
export function missedQuestions(
	answerKey: Readonly<Record<string, number>>,
	answers: Readonly<Record<string, number>>,
	completedSections: readonly string[]
) {
	const taken = new Set(completedSections);
	return Object.entries(answerKey)
		.filter(([name]) => taken.has(name.split(':')[0] ?? ''))
		.filter(([name]) => REVIEWABLE_PARTS.has(partOf(name)))
		.filter(([name, answer]) => answers[name] !== answer)
		.map(([name]) => name);
}

export function mistakeKey(examId: string, questionKey: string) {
	return `${MISTAKE_PREFIX}${examId}:${questionKey}`;
}

export function parseMistakeKey(itemKey: string) {
	if (!itemKey.startsWith(MISTAKE_PREFIX)) return null;
	const rest = itemKey.slice(MISTAKE_PREFIX.length);
	const split = rest.indexOf(':');
	if (split <= 0) return null;
	return { examId: rest.slice(0, split), questionKey: rest.slice(split + 1) };
}
