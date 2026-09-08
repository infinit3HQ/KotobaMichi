import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class TrackProgressDto {
  @IsString()
  @IsNotEmpty()
  wordId: string;

  @IsInt()
  @Min(0)
  @Max(10)
  masteryLevel: number;
}
