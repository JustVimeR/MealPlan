import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RecipesModule } from './recipes/recipes.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { ShoppingListsModule } from './shopping-lists/shopping-lists.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/mealplan',
    ),
    IngredientsModule,
    RecipesModule,
    MealPlansModule,
    ShoppingListsModule,
  ],
})
export class AppModule {}
