import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<User>) {}

  findByEmail(email: string) {
    return this.model.findOne({ email }).lean().exec();
  }

  create(data: Partial<User>) {
    return this.model.create(data);
  }

  async getByIdLean(id: string) {
    const u = await this.model.findById(id).lean().exec();
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async updateById(id: string, patch: Partial<User>) {
    const u = await this.model
      .findByIdAndUpdate(id, patch, { new: true })
      .lean()
      .exec();
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
}
