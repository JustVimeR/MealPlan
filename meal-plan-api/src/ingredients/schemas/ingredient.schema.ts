import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Ingredient {
  @Prop({ required: true, index: true }) name: string; // "Rice"
  @Prop({ required: true }) unit: string; // "g" | "ml" | "pcs"
  @Prop({ required: true, default: 'other', index: true }) category: string; // "grains", "dairy", ...
  // опціонально нутрієнти на 100 од.
  @Prop() kcalPer100?: number;
  @Prop() proteinPer100?: number;
  @Prop() fatPer100?: number;
  @Prop() carbPer100?: number;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);
