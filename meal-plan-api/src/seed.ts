import 'dotenv/config';
import mongoose from 'mongoose';
import { IngredientSchema } from './ingredients/schemas/ingredient.schema';
import { RecipeSchema } from './recipes/schemas/recipe.schema';

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mealplan';
  await mongoose.connect(uri);

  const IngredientModel = mongoose.model('Ingredient', IngredientSchema);
  const RecipeModel = mongoose.model('Recipe', RecipeSchema);

  await IngredientModel.deleteMany({});
  await RecipeModel.deleteMany({});

  const ing = await IngredientModel.insertMany([
    { name: 'Rice', unit: 'g', category: 'grains' },
    { name: 'Chicken breast', unit: 'g', category: 'meat' },
    { name: 'Egg', unit: 'pcs', category: 'dairy' },
    { name: 'Milk', unit: 'ml', category: 'dairy' },
    { name: 'Tomato', unit: 'g', category: 'vegetables' },
    { name: 'Cucumber', unit: 'g', category: 'vegetables' },
    { name: 'Pasta', unit: 'g', category: 'grains' },
    { name: 'Cheese', unit: 'g', category: 'dairy' },
    { name: 'Olive oil', unit: 'ml', category: 'oils' },
    { name: 'Oats', unit: 'g', category: 'grains' },
  ]);

  const map = Object.fromEntries(ing.map((i) => [i.name, i._id]));

  await RecipeModel.insertMany([
    {
      title: 'Tomato Pasta',
      servings: 2,
      minutes: 20,
      tags: ['quick'],
      items: [
        { ingredientId: map['Pasta'], qty: 200, unit: 'g' },
        { ingredientId: map['Tomato'], qty: 300, unit: 'g' },
        { ingredientId: map['Olive oil'], qty: 15, unit: 'ml' },
        { ingredientId: map['Cheese'], qty: 30, unit: 'g' },
      ],
    },
    {
      title: 'Chicken & Rice',
      servings: 2,
      minutes: 30,
      tags: ['protein'],
      items: [
        { ingredientId: map['Chicken breast'], qty: 300, unit: 'g' },
        { ingredientId: map['Rice'], qty: 160, unit: 'g' },
        { ingredientId: map['Olive oil'], qty: 10, unit: 'ml' },
      ],
    },
    {
      title: 'Omelette',
      servings: 1,
      minutes: 10,
      tags: ['breakfast'],
      items: [
        { ingredientId: map['Egg'], qty: 2, unit: 'pcs' },
        { ingredientId: map['Milk'], qty: 30, unit: 'ml' },
        { ingredientId: map['Cheese'], qty: 20, unit: 'g' },
      ],
    },
  ]);

  console.log('Seed done.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
