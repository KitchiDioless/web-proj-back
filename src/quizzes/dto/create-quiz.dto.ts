import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class CreateQuestionDto {
  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  image?: string | null;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];

  @IsInt()
  @Min(0)
  correctAnswer!: number;
}

export class CreateQuizDto {
  @IsInt()
  @Min(1)
  gameId!: number;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  coverImage?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions!: CreateQuestionDto[];
}

