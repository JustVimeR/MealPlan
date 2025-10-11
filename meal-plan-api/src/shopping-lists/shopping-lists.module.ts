import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ShoppingList,
  ShoppingListSchema,
} from './schemas/shopping-list.schema';
import {
  MealPlan,
  MealPlanSchema,
} from '../meal-plans/schemas/meal-plan.schema';
import { Recipe, RecipeSchema } from '../recipes/schemas/recipe.schema';
import {
  Ingredient,
  IngredientSchema,
} from '../ingredients/schemas/ingredient.schema';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingListsController } from './shopping-lists.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShoppingList.name, schema: ShoppingListSchema },
      { name: MealPlan.name, schema: MealPlanSchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: Ingredient.name, schema: IngredientSchema },
    ]),
  ],
  providers: [ShoppingListsService],
  controllers: [ShoppingListsController],
})
export class ShoppingListsModule {}
