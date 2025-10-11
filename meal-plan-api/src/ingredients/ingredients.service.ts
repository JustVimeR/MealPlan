import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Ingredient } from './schemas/ingredient.schema';
import { CreateIngredientDto } from './dto/create-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(@InjectModel(Ingredient.name) private model: Model<Ingredient>) {}

  create(dto: CreateIngredientDto) {
    return this.model.create(dto);
  }

  findAll(q?: string, category?: string) {
    const filter: FilterQuery<Ingredient> = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (category) filter.category = category;

    return this.model.find(filter).sort({ name: 1 }).limit(200).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new NotFoundException('Ingredient not found');
    return doc;
  }

  async update(id: string, patch: Partial<CreateIngredientDto>) {
    const doc = await this.model
      .findByIdAndUpdate(id, patch, { new: true })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('Ingredient not found');
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).lean().exec();
    if (!res) throw new NotFoundException('Ingredient not found');
    return { ok: true };
  }
}
