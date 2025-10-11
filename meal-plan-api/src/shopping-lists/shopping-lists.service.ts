import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShoppingList, ShoppingItemDoc } from './schemas/shopping-list.schema';
import { MealPlan, MealSlot } from '../meal-plans/schemas/meal-plan.schema';
import { Recipe } from '../recipes/schemas/recipe.schema';
import { Ingredient } from '../ingredients/schemas/ingredient.schema';

type Slot = MealSlot;

@Injectable()
export class ShoppingListsService {
  constructor(
    @InjectModel(ShoppingList.name) private slModel: Model<ShoppingList>,
    @InjectModel(MealPlan.name) private mpModel: Model<MealPlan>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    @InjectModel(Ingredient.name) private ingModel: Model<Ingredient>,
  ) {}

  async get(weekStartISO: string) {
    const doc = await this.slModel.findOne({ weekStartISO }).lean().exec();
    if (!doc) throw new NotFoundException('Shopping list not found');

    // збагачуємо назвами інгредієнтів
    const ids = Array.from(
      new Set(doc.items.map((i) => String(i.ingredientId))),
    );
    if (ids.length === 0) return doc;

    const ings = await this.ingModel
      .find({ _id: { $in: ids.map((x) => new Types.ObjectId(x)) } })
      .select({ name: 1, unit: 1, category: 1 })
      .lean()
      .exec();

    const byId = new Map(ings.map((x) => [String(x._id), x]));
    return {
      ...doc,
      items: doc.items.map((i) => ({
        ...i,
        ingredientName: byId.get(String(i.ingredientId))?.name ?? undefined,
        ingredient: byId.get(String(i.ingredientId)) ?? undefined,
      })),
    };
  }

  async generate(weekStartISO: string) {
    const plan = await this.mpModel.findOne({ weekStartISO }).lean().exec();
    if (!plan) throw new NotFoundException('Meal plan not found');

    // збираємо всі слоти
    const slots: Slot[] = [];
    for (const day of plan.days ?? []) {
      for (const meal of ['breakfast', 'lunch', 'dinner', 'snack'] as const) {
        const s = day?.[meal];
        if (s && s.recipeId) slots.push(s);
      }
    }

    const recipeIds = Array.from(
      new Set(slots.map((s) => String(s.recipeId))),
    ).map((id) => new Types.ObjectId(id));
    const recipes = await this.recipeModel
      .find({ _id: { $in: recipeIds } })
      .lean()
      .exec();

    // агрегація інгредієнтів
    const totals = new Map<string, { qty: number; unit: string }>();
    for (const slot of slots) {
      const recipe = recipes.find(
        (r) => String(r._id) === String(slot.recipeId),
      );
      if (!recipe) continue;
      const factor = (slot.servings ?? recipe.servings) / recipe.servings;
      for (const it of recipe.items) {
        const key = `${String(it.ingredientId)}:${it.unit}`;
        const prev = totals.get(key) ?? { qty: 0, unit: it.unit };
        totals.set(key, { qty: prev.qty + it.qty * factor, unit: it.unit });
      }
    }

    const items = [...totals.entries()].map(([key, v]) => {
      const [ingredientId] = key.split(':');
      return {
        ingredientId: new Types.ObjectId(ingredientId),
        totalQty: Number(v.qty.toFixed(2)),
        unit: v.unit,
        checked: false,
      };
    });

    const doc = await this.slModel
      .findOneAndUpdate(
        { weekStartISO },
        { $set: { items } },
        { upsert: true, new: true },
      )
      .lean()
      .exec();

    // збагачуємо назвами у відповіді одразу після генерації
    const ids = Array.from(
      new Set(doc.items.map((i) => String(i.ingredientId))),
    );
    if (ids.length === 0) return doc;

    const ings = await this.ingModel
      .find({ _id: { $in: ids.map((x) => new Types.ObjectId(x)) } })
      .select({ name: 1, unit: 1, category: 1 })
      .lean()
      .exec();

    const byId = new Map(ings.map((x) => [String(x._id), x]));
    return {
      ...doc,
      items: doc.items.map((i) => ({
        ...i,
        ingredientName: byId.get(String(i.ingredientId))?.name ?? undefined,
        ingredient: byId.get(String(i.ingredientId)) ?? undefined,
      })),
    };
  }

  async patchItem(
    weekStartISO: string,
    itemId: string,
    patch: {
      checked?: boolean;
      note?: string;
      totalQty?: number;
      index?: number;
    },
  ) {
    const doc = await this.slModel.findOne({ weekStartISO }).exec();
    if (!doc) throw new NotFoundException('Shopping list not found');

    const itemsWithId = doc.items as unknown as ShoppingItemDoc[];
    let idx = itemsWithId.findIndex((i) => String(i._id) === itemId);

    if (
      idx === -1 &&
      typeof patch.index === 'number' &&
      patch.index >= 0 &&
      patch.index < doc.items.length
    ) {
      idx = patch.index;
    }
    if (idx === -1) throw new NotFoundException('Item not found');

    if (typeof patch.checked === 'boolean')
      doc.items[idx].checked = patch.checked;
    if (typeof patch.totalQty === 'number')
      doc.items[idx].totalQty = patch.totalQty;
    if (typeof patch.note === 'string') doc.items[idx].note = patch.note;

    await doc.save();

    const lean = doc.toObject();
    const ids = Array.from(
      new Set(lean.items.map((i) => String(i.ingredientId))),
    );
    if (ids.length === 0) return lean;

    const ings = await this.ingModel
      .find({ _id: { $in: ids.map((x) => new Types.ObjectId(x)) } })
      .select({ name: 1, unit: 1, category: 1 })
      .lean()
      .exec();

    const byId = new Map(ings.map((x) => [String(x._id), x]));
    return {
      ...lean,
      items: lean.items.map((i) => ({
        ...i,
        ingredientName: byId.get(String(i.ingredientId))?.name ?? undefined,
        ingredient: byId.get(String(i.ingredientId)) ?? undefined,
      })),
    };
  }

  async clearChecked(weekStartISO: string) {
    const doc = await this.slModel.findOne({ weekStartISO }).exec();
    if (!doc) throw new NotFoundException('Shopping list not found');

    doc.items = doc.items.filter((i) => !i.checked);
    await doc.save();

    const lean = doc.toObject();
    const ids = Array.from(
      new Set(lean.items.map((i) => String(i.ingredientId))),
    );
    if (ids.length === 0) return lean;

    const ings = await this.ingModel
      .find({ _id: { $in: ids.map((x) => new Types.ObjectId(x)) } })
      .select({ name: 1, unit: 1, category: 1 })
      .lean()
      .exec();

    const byId = new Map(ings.map((x) => [String(x._id), x]));
    return {
      ...lean,
      items: lean.items.map((i) => ({
        ...i,
        ingredientName: byId.get(String(i.ingredientId))?.name ?? undefined,
        ingredient: byId.get(String(i.ingredientId)) ?? undefined,
      })),
    };
  }
}
