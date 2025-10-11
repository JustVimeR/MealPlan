import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Recipe } from './schemas/recipe.schema';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(@InjectModel(Recipe.name) private model: Model<Recipe>) {}

  create(dto: CreateRecipeDto) {
    return this.model.create(dto);
  }

  search(q?: string, tags?: string[]) {
    const filter: FilterQuery<Recipe> = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (tags && tags.length > 0) filter.tags = { $all: tags };

    return this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid id');
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new NotFoundException('Recipe not found');
    return doc;
  }

  async update(id: string, patch: Partial<CreateRecipeDto>) {
    const doc = await this.model
      .findByIdAndUpdate(id, patch, { new: true })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('Recipe not found');
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).lean().exec();
    if (!res) throw new NotFoundException('Recipe not found');
    return { ok: true };
  }
}
