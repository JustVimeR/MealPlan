import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class SlotDto {
  @IsString() recipeId: string;
  @IsInt() @Min(1) servings: number;
}
class DayDto {
  @IsOptional() @ValidateNested() @Type(() => SlotDto) breakfast?: SlotDto;
  @IsOptional() @ValidateNested() @Type(() => SlotDto) lunch?: SlotDto;
  @IsOptional() @ValidateNested() @Type(() => SlotDto) dinner?: SlotDto;
  @IsOptional() @ValidateNested() @Type(() => SlotDto) snack?: SlotDto;
}
export class UpsertMealPlanDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayDto)
  days: DayDto[];
}
