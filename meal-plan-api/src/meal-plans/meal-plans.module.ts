import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealPlan, MealPlanSchema } from './schemas/meal-plan.schema';
import { MealPlansService } from './meal-plans.service';
import { MealPlansController } from './meal-plans.controller';
import { Recipe, RecipeSchema } from '../recipes/schemas/recipe.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MealPlan.name, schema: MealPlanSchema },
      { name: Recipe.name, schema: RecipeSchema },
    ]),
  ],
  providers: [MealPlansService],
  controllers: [MealPlansController],
  exports: [MealPlansService],
})
export class MealPlansModule {}
