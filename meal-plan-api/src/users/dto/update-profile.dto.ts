import { IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(120) displayName?: string;
  @IsOptional() @IsInt() @Min(0) calorieTarget?: number;
}
