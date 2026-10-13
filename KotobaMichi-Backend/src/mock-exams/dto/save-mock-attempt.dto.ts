import { IsInt, IsObject, Max, Min } from 'class-validator';

export class SaveMockAttemptDto {
	@IsInt()
	@Min(0)
	@Max(20)
	sectionIndex!: number;

	@IsInt()
	@Min(0)
	sectionStartedAt!: number;

	@IsObject()
	answers!: Record<string, number>;
}
