import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
class RecipeItem {
  @Prop({ type: Types.ObjectId, ref: 'Ingredient', required: true })
  ingredientId!: Types.ObjectId;

  @Prop({ required: true }) qty!: number;
  @Prop({ required: true }) unit!: string; // g | ml | pcs
}

@Schema({ _id: false })
class PublicItem {
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) unit!: string;
  @Prop({ required: true }) qty!: number;
}

@Schema({ _id: false })
class PublicSnapshot {
  @Prop({ required: true }) title!: string;
  @Prop() minutes?: number;
  @Prop({ required: true }) servings!: number;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: [PublicItem], default: [] }) items!: PublicItem[];
}

@Schema({ timestamps: true })
export class Recipe {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true }) title!: string;
  @Prop() minutes?: number;
  @Prop({ default: 2 }) servings!: number;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: [RecipeItem], default: [] }) items!: RecipeItem[];

  // публікація
  @Prop({ default: false, index: true }) isPublic!: boolean;
  @Prop({ type: PublicSnapshot, required: false })
  publicSnapshot?: PublicSnapshot;
}

export type RecipeDocument = HydratedDocument<Recipe>;
export const RecipeSchema = SchemaFactory.createForClass(Recipe);

RecipeSchema.index({ userId: 1, title: 1 }, { unique: false });
