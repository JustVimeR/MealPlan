import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

export class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) @MaxLength(100) password!: string;
  @IsOptional() @IsString() displayName?: string;
  @IsOptional() @IsInt() @Min(0) calorieTarget?: number;
}
