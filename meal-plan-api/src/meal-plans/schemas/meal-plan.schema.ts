import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type MealSlot = {
  recipeId: Types.ObjectId;
  servings: number;
};

export type DayPlanShape = {
  breakfast?: MealSlot;
  lunch?: MealSlot;
  dinner?: MealSlot;
  snack?: MealSlot;
};

@Schema({ _id: false })
class DayPlan {
  @Prop({ type: Object }) breakfast?: MealSlot;
  @Prop({ type: Object }) lunch?: MealSlot;
  @Prop({ type: Object }) dinner?: MealSlot;
  @Prop({ type: Object }) snack?: MealSlot;
}

function emptyDaysDefault(): ReadonlyArray<Record<string, never>> {
  return Array.from({ length: 7 }, () => ({}) as Record<string, never>);
}

@Schema({ timestamps: true })
export class MealPlan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;
  @Prop({ required: true }) weekStartISO!: string;
  @Prop({ type: [Object], required: true, default: emptyDaysDefault })
  days!: DayPlan[];
}

export type MealPlanDocument = HydratedDocument<MealPlan>;
export const MealPlanSchema = SchemaFactory.createForClass(MealPlan);

MealPlanSchema.index(
  { userId: 1, weekStartISO: 1 },
  { unique: true, sparse: true },
);
MealPlanSchema.index(
  { weekStartISO: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: false } } },
);
