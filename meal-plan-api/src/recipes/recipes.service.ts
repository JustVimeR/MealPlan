import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Recipe } from './schemas/recipe.schema';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { Ingredient } from '../ingredients/schemas/ingredient.schema';

// TS-тип для публічного снепшота (щоб уникнути any)
type PublicSnapshotShape = {
  title: string;
  minutes?: number;
  servings: number;
  tags: string[];
  items: { name: string; unit: string; qty: number }[];
};

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private model: Model<Recipe>,
    @InjectModel(Ingredient.name) private ingModel: Model<Ingredient>,
  ) {}

  list(userId: string, q?: string) {
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
    return this.model.find(filter).sort({ title: 1 }).lean().exec();
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
      .select({ publicSnapshot: 1 })
      .sort({ 'publicSnapshot.title': 1 })
      .lean()
      .exec()
      .then((arr) =>
        arr.map((r) => ({
          _id: r._id,
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

    // зберемо снепшот з назв інгредієнтів
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

    // присвоюємо без any
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
