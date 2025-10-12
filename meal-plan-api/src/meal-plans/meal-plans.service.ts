import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { MealPlan } from './schemas/meal-plan.schema';
import type { DayPlanShape, MealSlot } from './schemas/meal-plan.schema';
import type { UpsertMealPlanDto } from './dto/upsert-meal-plan.dto';
import { Recipe } from '../recipes/schemas/recipe.schema';
import { Ingredient } from '../ingredients/schemas/ingredient.schema';

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
    @InjectModel(Ingredient.name) private ingModel: Model<Ingredient>,
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

  // ===== Nutrition for week (без type assertions) =====
  // всередині класу MealPlansService
  async getWeekNutrition(weekStartISO: string, userId: string) {
    type NutritionTotals = {
      kcal: number;
      protein: number;
      fat: number;
      carb: number;
    };

    const zero: NutritionTotals = { kcal: 0, protein: 0, fat: 0, carb: 0 };
    const filter: FilterQuery<MealPlan> = {
      weekStartISO,
      userId: new Types.ObjectId(userId),
    };
    const plan = await this.model.findOne(filter).lean().exec();

    if (!plan) {
      return {
        weekStartISO,
        days: [] as Array<{ dayIndex: number; totals: NutritionTotals }>,
        totals: zero,
      };
    }

    // зберемо всі recipeIds
    const recipeIds = new Set<string>();
    for (const d of plan.days ?? []) {
      for (const meal of MEALS) {
        const s = d?.[meal];
        if (s?.recipeId) recipeIds.add(String(s.recipeId));
      }
    }

    const recipes = await this.recipeModel
      .find({
        _id: { $in: Array.from(recipeIds).map((x) => new Types.ObjectId(x)) },
        userId: new Types.ObjectId(userId),
      })
      .lean()
      .exec();
    const recipeById = new Map(recipes.map((r) => [String(r._id), r]));

    // інгредієнти всіх рецептів
    const allIngredientIds = new Set<string>();
    for (const r of recipes) {
      for (const it of r.items) allIngredientIds.add(String(it.ingredientId));
    }
    const ingredients = await this.ingModel
      .find({
        _id: {
          $in: Array.from(allIngredientIds).map((x) => new Types.ObjectId(x)),
        },
        userId: new Types.ObjectId(userId),
      })
      .lean()
      .exec();
    const ingById = new Map(ingredients.map((i) => [String(i._id), i]));

    // локальна ф-ція без кастів
    const computeFor = (rid: string): NutritionTotals => {
      const r = recipeById.get(rid);
      if (!r) return zero;

      let kcal = 0,
        protein = 0,
        fat = 0,
        carb = 0;

      for (const it of r.items) {
        const ing = ingById.get(String(it.ingredientId));
        if (!ing) continue;

        let factor = 0;
        if (ing.unit === 'g' && it.unit === 'g') factor = it.qty / 100;
        else if (ing.unit === 'ml' && it.unit === 'ml') factor = it.qty / 100;
        else if (ing.unit === 'pcs' && it.unit === 'pcs') factor = it.qty;
        else continue;

        const k = ing.kcalPer100 ?? 0;
        const p = ing.proteinPer100 ?? 0;
        const f = ing.fatPer100 ?? 0;
        const c = ing.carbPer100 ?? 0;

        kcal += k * factor;
        protein += p * factor;
        fat += f * factor;
        carb += c * factor;
      }

      return {
        kcal: Number(kcal.toFixed(1)),
        protein: Number(protein.toFixed(1)),
        fat: Number(fat.toFixed(1)),
        carb: Number(carb.toFixed(1)),
      };
    };

    const daysOut: Array<{ dayIndex: number; totals: NutritionTotals }> = [];
    let weekTotals: NutritionTotals = { ...zero };

    const days = plan.days ?? [];
    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      let dayTotals: NutritionTotals = { ...zero };

      for (const meal of MEALS) {
        const s = d?.[meal];
        if (!s?.recipeId) continue;

        const base = computeFor(String(s.recipeId));
        const rec = recipeById.get(String(s.recipeId));
        const factor =
          rec && rec.servings > 0
            ? (s.servings ?? rec.servings) / rec.servings
            : 1;

        dayTotals = {
          kcal: Number((dayTotals.kcal + base.kcal * factor).toFixed(1)),
          protein: Number(
            (dayTotals.protein + base.protein * factor).toFixed(1),
          ),
          fat: Number((dayTotals.fat + base.fat * factor).toFixed(1)),
          carb: Number((dayTotals.carb + base.carb * factor).toFixed(1)),
        };
      }

      daysOut.push({ dayIndex: i, totals: dayTotals });
      weekTotals = {
        kcal: Number((weekTotals.kcal + dayTotals.kcal).toFixed(1)),
        protein: Number((weekTotals.protein + dayTotals.protein).toFixed(1)),
        fat: Number((weekTotals.fat + dayTotals.fat).toFixed(1)),
        carb: Number((weekTotals.carb + dayTotals.carb).toFixed(1)),
      };
    }

    return { weekStartISO, days: daysOut, totals: weekTotals };
  }
}
