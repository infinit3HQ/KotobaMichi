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
import { AT_MENU, MOCK_SECTION_IDS } from '../sections';

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
	@IsIn(MOCK_SECTION_IDS, { each: true })
	completedSections?: string[];
}
