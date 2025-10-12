import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() displayName?: string;

  @IsOptional() @IsUrl({ require_tld: false }) avatarUrl?: string;

  @IsOptional() @IsInt() @Min(0) calorieTarget?: number;

  @IsOptional() @IsInt() @Min(0) protein?: number;
  @IsOptional() @IsInt() @Min(0) fat?: number;
  @IsOptional() @IsInt() @Min(0) carb?: number;

  @IsOptional()
  @IsIn(['metric', 'imperial'])
  units?: 'metric' | 'imperial';

  @IsOptional()
  @IsIn(['monday', 'sunday'])
  weekStart?: 'monday' | 'sunday';

  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsArray()
  dietary?: string[];

  @IsOptional()
  @IsArray()
  allergens?: string[];
}
