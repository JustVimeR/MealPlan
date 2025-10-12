import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { MealPlan } from './schemas/meal-plan.schema';
import type { DayPlanShape, MealSlot } from './schemas/meal-plan.schema';
import type { UpsertMealPlanDto } from './dto/upsert-meal-plan.dto';
import { Recipe } from '../recipes/schemas/recipe.schema';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealKey = (typeof MEALS)[number];

type EnrichedSlot = MealSlot & {
  title?: string;
  minutes?: number;
  recipeServings?: number;
};
type EnrichedDayPlan = Omit<DayPlanShape, MealKey> &
  Partial<Record<MealKey, EnrichedSlot>>;

@Injectable()
export class MealPlansService {
  constructor(
    @InjectModel(MealPlan.name) private model: Model<MealPlan>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
  ) {}

  async getForWeek(weekStartISO: string, userId?: string) {
    const filter: FilterQuery<MealPlan> = userId
      ? { weekStartISO, userId: new Types.ObjectId(userId) }
      : { weekStartISO };

    const doc = await this.model.findOne(filter).lean().exec();
    if (doc) return this.enrichWithRecipeTitles(doc);

    const emptyDays: DayPlanShape[] = Array.from(
      { length: 7 },
      () => ({}) as DayPlanShape,
    );
    return { weekStartISO, days: emptyDays };
  }

  async upsertForWeek(
    weekStartISO: string,
    userId: string,
    dto: UpsertMealPlanDto,
  ) {
    const toSlot = (s?: { recipeId: string; servings: number }) =>
      s
        ? { recipeId: new Types.ObjectId(s.recipeId), servings: s.servings }
        : undefined;

    const days: DayPlanShape[] = (dto.days ?? []).map((d) => ({
      breakfast: toSlot(d.breakfast),
      lunch: toSlot(d.lunch),
      dinner: toSlot(d.dinner),
      snack: toSlot(d.snack),
    }));

    const saved = await this.model
      .findOneAndUpdate(
        { weekStartISO, userId: new Types.ObjectId(userId) },
        { $set: { days, userId: new Types.ObjectId(userId) } },
        { upsert: true, new: true },
      )
      .lean()
      .exec();

    return this.enrichWithRecipeTitles(saved);
  }

  private async enrichWithRecipeTitles(doc: {
    weekStartISO: string;
    days: DayPlanShape[];
  }) {
    const ids = new Set<string>();
    for (const day of doc.days ?? []) {
      for (const meal of MEALS) {
        const s = day?.[meal];
        if (s?.recipeId) ids.add(String(s.recipeId));
      }
    }
    if (ids.size === 0) return doc;

    const recipes = await this.recipeModel
      .find({ _id: { $in: Array.from(ids).map((x) => new Types.ObjectId(x)) } })
      .select({ title: 1, minutes: 1, servings: 1 })
      .lean()
      .exec();

    const byId = new Map(recipes.map((r) => [String(r._id), r]));

    const days: EnrichedDayPlan[] = (doc.days ?? []).map((d) => {
      const out: EnrichedDayPlan = { ...d };
      for (const meal of MEALS) {
        const s = d[meal];
        if (s?.recipeId) {
          const r = byId.get(String(s.recipeId));
          if (r) {
            const enriched: EnrichedSlot = {
              ...s,
              title: r.title,
              minutes: r.minutes,
              recipeServings: r.servings,
            };
            out[meal] = enriched;
          }
        }
      }
      return out;
    });

    return { ...doc, days };
  }
}
