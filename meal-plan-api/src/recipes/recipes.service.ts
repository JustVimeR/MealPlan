import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Recipe } from './schemas/recipe.schema';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { Ingredient } from '../ingredients/schemas/ingredient.schema';

type PublicSnapshotShape = {
  title: string;
  minutes?: number;
  servings: number;
  tags: string[];
  items: { name: string; unit: string; qty: number }[];
};

export type NutritionTotals = {
  kcal: number;
  protein: number;
  fat: number;
  carb: number;
};

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private model: Model<Recipe>,
    @InjectModel(Ingredient.name) private ingModel: Model<Ingredient>,
  ) {}

  async list(userId: string, q?: string, withNutrition = false) {
    const filter: FilterQuery<Recipe> = {
      userId: new Types.ObjectId(userId),
      ...(q
        ? {
            $or: [
              {
                title: {
                  $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                  $options: 'i',
                },
              },
              { tags: { $in: [new RegExp(q, 'i')] } },
            ],
          }
        : {}),
    };
    const rows = await this.model.find(filter).sort({ title: 1 }).lean().exec();

    if (!withNutrition) return rows;

    // Чітко типізований масив, щоб не було `never[]`
    const enriched = await Promise.all(
      rows.map(async (r) => {
        const n = await this.computeRecipeNutrition(userId, String(r._id));
        return {
          ...r,
          nutrition: n,
          nutritionPerServing: this.perServing(n, r.servings),
        };
      }),
    );

    return enriched as Array<
      (typeof rows)[number] & {
        nutrition: NutritionTotals;
        nutritionPerServing: NutritionTotals;
      }
    >;
  }

  create(userId: string, dto: CreateRecipeDto) {
    return this.model.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      isPublic: false,
      publicSnapshot: undefined,
    });
  }

  async remove(userId: string, id: string) {
    const res = await this.model
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .lean()
      .exec();
    if (!res) throw new NotFoundException('Recipe not found');
    return { ok: true };
  }

  // ---------- Nutrition ----------

  async getRecipeNutrition(userId: string, recipeId: string) {
    const totals = await this.computeRecipeNutrition(userId, recipeId);
    const recipe = await this.model
      .findOne({
        _id: new Types.ObjectId(recipeId),
        userId: new Types.ObjectId(userId),
      })
      .lean()
      .exec();
    if (!recipe) throw new NotFoundException('Recipe not found');
    return {
      recipeId,
      servings: recipe.servings,
      totals,
      perServing: this.perServing(totals, recipe.servings),
    };
  }

  private perServing(t: NutritionTotals, servings: number): NutritionTotals {
    const s = servings > 0 ? servings : 1;
    return {
      kcal: Number((t.kcal / s).toFixed(1)),
      protein: Number((t.protein / s).toFixed(1)),
      fat: Number((t.fat / s).toFixed(1)),
      carb: Number((t.carb / s).toFixed(1)),
    };
  }

  private async computeRecipeNutrition(
    userId: string,
    recipeId: string,
  ): Promise<NutritionTotals> {
    const recipe = await this.model
      .findOne({
        _id: new Types.ObjectId(recipeId),
        userId: new Types.ObjectId(userId),
      })
      .lean()
      .exec();
    if (!recipe) throw new NotFoundException('Recipe not found');

    const ingIds = Array.from(
      new Set(recipe.items.map((i) => String(i.ingredientId))),
    );
    const ings = await this.ingModel
      .find({
        _id: { $in: ingIds.map((id) => new Types.ObjectId(id)) },
        userId: new Types.ObjectId(userId),
      })
      .lean()
      .exec();
    const byId = new Map(ings.map((i) => [String(i._id), i]));

    let kcal = 0,
      protein = 0,
      fat = 0,
      carb = 0;

    for (const it of recipe.items) {
      const ing = byId.get(String(it.ingredientId));
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
  }

  // ---------- Public library ----------

  listPublic(q?: string) {
    const filter: FilterQuery<Recipe> = {
      isPublic: true,
      ...(q
        ? {
            'publicSnapshot.title': {
              $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              $options: 'i',
            },
          }
        : {}),
    };
    return this.model
      .find(filter)
      .select({ publicSnapshot: 1, userId: 1 })
      .sort({ 'publicSnapshot.title': 1 })
      .lean()
      .exec()
      .then((arr) =>
        arr.map((r) => ({
          _id: r._id,
          ownerId: String(r.userId),
          ...r.publicSnapshot,
        })),
      );
  }

  async publish(userId: string, recipeId: string) {
    const recipe = await this.model.findOne({
      _id: new Types.ObjectId(recipeId),
      userId: new Types.ObjectId(userId),
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    const ingIds = Array.from(
      new Set(recipe.items.map((i) => String(i.ingredientId))),
    ).map((id) => new Types.ObjectId(id));
    const ings = await this.ingModel
      .find({ _id: { $in: ingIds }, userId: new Types.ObjectId(userId) })
      .select({ name: 1 })
      .lean()
      .exec();
    const nameById = new Map(ings.map((i) => [String(i._id), i.name]));

    const snapshot: PublicSnapshotShape = {
      title: recipe.title,
      minutes: recipe.minutes,
      servings: recipe.servings,
      tags: recipe.tags,
      items: recipe.items.map((it) => ({
        name: nameById.get(String(it.ingredientId)) ?? 'ingredient',
        unit: it.unit,
        qty: it.qty,
      })),
    };

    recipe.isPublic = true;
    recipe.publicSnapshot = snapshot as unknown as NonNullable<
      Recipe['publicSnapshot']
    >;
    await recipe.save();
    return { ok: true };
  }

  async unpublish(userId: string, recipeId: string) {
    const recipe = await this.model.findOne({
      _id: new Types.ObjectId(recipeId),
      userId: new Types.ObjectId(userId),
    });
    if (!recipe) throw new NotFoundException('Recipe not found');
    recipe.isPublic = false;
    recipe.publicSnapshot = undefined;
    await recipe.save();
    return { ok: true };
  }

  async fork(targetUserId: string, publicRecipeId: string) {
    const src = await this.model
      .findOne({
        _id: new Types.ObjectId(publicRecipeId),
        isPublic: true,
      })
      .lean()
      .exec();

    if (!src?.publicSnapshot)
      throw new NotFoundException('Public recipe not found');

    // 🚫 Забороняємо форк власного рецепта
    if (String(src.userId) === String(targetUserId)) {
      throw new BadRequestException('You cannot fork your own recipe');
    }

    const snapshot = src.publicSnapshot;
    const createdItems: {
      ingredientId: Types.ObjectId;
      unit: string;
      qty: number;
    }[] = [];

    for (const it of snapshot.items) {
      const existing = await this.ingModel
        .findOne({
          userId: new Types.ObjectId(targetUserId),
          name: it.name,
        })
        .lean()
        .exec();

      let ingId: Types.ObjectId;
      if (existing) {
        ingId = new Types.ObjectId(existing._id);
      } else {
        const created = await this.ingModel.create({
          userId: new Types.ObjectId(targetUserId),
          name: it.name,
          unit: it.unit,
          category: 'other',
        });
        ingId = new Types.ObjectId(created._id);
      }

      createdItems.push({ ingredientId: ingId, unit: it.unit, qty: it.qty });
    }

    const createdRecipe = await this.model.create({
      userId: new Types.ObjectId(targetUserId),
      title: snapshot.title,
      minutes: snapshot.minutes,
      servings: snapshot.servings,
      tags: snapshot.tags,
      items: createdItems,
      isPublic: false,
      publicSnapshot: undefined,
    });

    return { ok: true, _id: createdRecipe._id };
  }
}
