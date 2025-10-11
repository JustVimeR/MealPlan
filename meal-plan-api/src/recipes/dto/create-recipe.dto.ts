import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RecipeItemDto {
  @IsString() ingredientId: string;
  @IsString() @IsNotEmpty() unit: string;
  @Min(0.01) qty: number;
}

export class CreateRecipeDto {
  @IsString() @IsNotEmpty() title: string;
  @IsOptional() @IsString() description?: string;
  @IsInt() @Min(1) servings: number = 2;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  items: RecipeItemDto[];

  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() minutes?: number;
}
