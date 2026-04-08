import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsOptional()
  avatarUrl?: string | null;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

