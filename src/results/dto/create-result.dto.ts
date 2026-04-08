import { IsInt, Min, IsOptional } from 'class-validator';

export class CreateResultDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsInt()
  @Min(1)
  quizId!: number;

  @IsInt()
  @Min(0)
  score!: number;

  @IsInt()
  @Min(1)
  totalQuestions!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSeconds?: number;
}

