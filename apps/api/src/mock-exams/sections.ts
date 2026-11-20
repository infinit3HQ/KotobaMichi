/** The three blocks of every N3 paper, in the order the real exam runs them. */
export const MOCK_SECTION_IDS = [
	'vocabulary',
	'grammar-reading',
	'listening',
] as const;

export type MockSectionId = (typeof MOCK_SECTION_IDS)[number];

/** `sectionIndex` while the student is on the section menu rather than inside a section. */
export const AT_MENU = -1;

/**
 * The sections a sitting has closed, in paper order.
 * Clients from before sections could be taken in any order send no list, so it is
 * derived from their position: everything before `sectionIndex`, or all three once finished.
 */
export function completedSectionsFor(
	raw: readonly string[] | undefined,
	sectionIndex: number,
	finished: boolean
): MockSectionId[] {
	if (raw) {
		const wanted = new Set(raw);
		return MOCK_SECTION_IDS.filter(id => wanted.has(id));
	}
	if (finished) return [...MOCK_SECTION_IDS];
	return MOCK_SECTION_IDS.slice(0, Math.max(0, sectionIndex));
}
