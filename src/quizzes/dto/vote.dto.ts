import { IsIn, IsInt, IsOptional } from 'class-validator';

export class VoteDto {
  @IsInt()
  userId!: number;

  @IsOptional()
  @IsIn(['up', 'down'])
  vote?: 'up' | 'down' | null;
}

