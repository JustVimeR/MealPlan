import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Ingredient } from './schemas/ingredient.schema';
import { CreateIngredientDto } from './dto/create-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(@InjectModel(Ingredient.name) private model: Model<Ingredient>) {}

  list(userId: string, q?: string) {
    const filter: FilterQuery<Ingredient> = {
      userId: new Types.ObjectId(userId),
      ...(q
        ? {
            name: {
              $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              $options: 'i',
            },
          }
        : {}),
    };
    return this.model.find(filter).sort({ name: 1 }).lean().exec();
  }

  create(userId: string, dto: CreateIngredientDto) {
    return this.model.create({
      ...dto,
      userId: new Types.ObjectId(userId),
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
    if (!res) throw new NotFoundException('Ingredient not found');
    return { ok: true };
  }
}
