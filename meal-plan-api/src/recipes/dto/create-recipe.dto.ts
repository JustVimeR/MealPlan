import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsMongoId,
  IsOptional,
  IsPositive,
  IsString,
  IsIn,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RecipeItemDto {
  @IsMongoId()
  ingredientId!: string;

  @IsIn(['g', 'ml', 'pcs'])
  unit!: 'g' | 'ml' | 'pcs';

  @IsPositive()
  qty!: number;
}

export class CreateRecipeDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  minutes?: number;

  @IsInt()
  @Min(1)
  servings!: number;

  @IsArray()
  @ArrayMinSize(0)
  @IsString({ each: true })
  tags!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  items!: RecipeItemDto[];
}
