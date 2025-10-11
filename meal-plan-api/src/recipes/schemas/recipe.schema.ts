import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
class RecipeItem {
  @Prop({ type: Types.ObjectId, ref: 'Ingredient', required: true })
  ingredientId: Types.ObjectId;

  @Prop({ required: true }) qty: number; // кількість на рецепт
  @Prop({ required: true }) unit: string; // g | ml | pcs
}

@Schema({ timestamps: true })
export class Recipe {
  @Prop({ required: true, index: true }) title: string;
  @Prop() description?: string;
  @Prop({ default: 2 }) servings: number;
  @Prop({ type: [RecipeItem], default: [] }) items: RecipeItem[];
  @Prop({ type: [String], default: [] }) tags: string[];
  @Prop() minutes?: number;
  // ownerId додамо пізніше, коли підключимо auth
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
