import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
class ShoppingItem {
  @Prop({ type: Types.ObjectId, ref: 'Ingredient', required: true })
  ingredientId: Types.ObjectId;
  @Prop({ required: true }) totalQty: number;
  @Prop({ required: true }) unit: string;
  @Prop({ default: false }) checked: boolean;
  @Prop() note?: string;
}

@Schema({ timestamps: true })
export class ShoppingList {
  @Prop({ required: true }) weekStartISO: string;
  @Prop({ type: [ShoppingItem], default: [] }) items: ShoppingItem[];
}
export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList);
ShoppingListSchema.index({ weekStartISO: 1 }, { unique: true });

export type ShoppingItemDoc = {
  _id: Types.ObjectId;
  ingredientId: Types.ObjectId;
  totalQty: number;
  unit: string;
  checked: boolean;
  note?: string;
};
