/** The three blocks of every N3 paper, in the order the real exam runs them. */
export const MOCK_SECTION_IDS = [
	'vocabulary',
	'grammar-reading',
	'listening',
] as const;

export type MockSectionId = (typeof MOCK_SECTION_IDS)[number];

/** N2 sits 言語知識 and 読解 on one clock. N3 keeps the three ids above. */
export const KNOWN_SECTION_IDS = [
	...MOCK_SECTION_IDS,
	'language-reading',
] as const;

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
	finished: boolean,
	sectionIds: readonly string[] = MOCK_SECTION_IDS
): string[] {
	if (raw) {
		const wanted = new Set(raw);
		return sectionIds.filter(id => wanted.has(id));
	}
	if (finished) return [...sectionIds];
	return sectionIds.slice(0, Math.max(0, sectionIndex));
}
