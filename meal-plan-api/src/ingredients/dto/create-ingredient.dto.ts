import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateIngredientDto {
  @IsString() name: string;
  @IsString() unit: string; // g | ml | pcs
  @IsString() category: string;

  @IsOptional() @IsNumber() @Min(0) kcalPer100?: number;
  @IsOptional() @IsNumber() @Min(0) proteinPer100?: number;
  @IsOptional() @IsNumber() @Min(0) fatPer100?: number;
  @IsOptional() @IsNumber() @Min(0) carbPer100?: number;
}
