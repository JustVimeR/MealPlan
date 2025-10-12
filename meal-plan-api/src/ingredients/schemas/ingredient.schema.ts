import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Ingredient {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) unit!: string; // g | ml | pcs
  @Prop({ required: true }) category!: string;

  @Prop() kcalPer100?: number;
  @Prop() proteinPer100?: number;
  @Prop() fatPer100?: number;
  @Prop() carbPer100?: number;
}

export type IngredientDocument = HydratedDocument<Ingredient>;
export const IngredientSchema = SchemaFactory.createForClass(Ingredient);

IngredientSchema.index({ userId: 1, name: 1 }, { unique: true });
