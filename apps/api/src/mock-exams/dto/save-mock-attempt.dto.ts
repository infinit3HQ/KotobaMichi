import {
	ArrayMaxSize,
	IsArray,
	IsIn,
	IsInt,
	IsObject,
	IsOptional,
	Max,
	Min,
} from 'class-validator';
import {
	AT_MENU,
	KNOWN_SECTION_IDS,
	MOCK_MODES,
	MOCK_SECTION_IDS,
	type MockMode,
} from '../sections';

export class SaveMockAttemptDto {
	/** The open section, or -1 while the student is on the section menu. */
	@IsInt()
	@Min(AT_MENU)
	@Max(20)
	sectionIndex!: number;

	@IsInt()
	@Min(0)
	sectionStartedAt!: number;

	@IsObject()
	answers!: Record<string, number>;

	/** Sections already closed. Older clients that only go in order leave this out. */
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(MOCK_SECTION_IDS.length)
	@IsIn(KNOWN_SECTION_IDS, { each: true })
	completedSections?: string[];

	/** Older clients leave this out; their sittings are strict. */
	@IsOptional()
	@IsIn(MOCK_MODES)
	mode?: MockMode;

	/** When the practice clock was paused, or null while it runs. Ignored in strict mode. */
	@IsOptional()
	@IsInt()
	@Min(0)
	pausedAt?: number | null;
}
