import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { User } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<User>) {}

  getByIdLean(userId: string) {
    return this.model
      .findById(new Types.ObjectId(userId))
      .select({
        _id: 1,
        email: 1,
        displayName: 1,
        avatarUrl: 1,
        calorieTarget: 1,
        macroTargets: 1,
        preferences: 1,
      })
      .lean()
      .exec();
  }

  async findByEmail(email: string) {
    return this.model
      .findOne({ email })
      .select({
        email: 1,
        passwordHash: 1,
        displayName: 1,
        avatarUrl: 1,
        calorieTarget: 1,
        macroTargets: 1,
        preferences: 1,
      })
      .lean()
      .exec();
  }

  async create(input: {
    email: string;
    passwordHash: string;
    displayName?: string;
    avatarUrl?: string;
    calorieTarget?: number;
    macroTargets?: { protein?: number; fat?: number; carb?: number };
    preferences?: {
      units?: 'metric' | 'imperial';
      weekStart?: 'monday' | 'sunday';
      theme?: 'light' | 'dark' | 'system';
      dietary?: string[];
      allergens?: string[];
    };
    roles?: string[];
  }) {
    const doc = await this.model.create({
      email: input.email,
      passwordHash: input.passwordHash,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
      calorieTarget: input.calorieTarget ?? 0,
      macroTargets: input.macroTargets ?? {},
      preferences: input.preferences ?? {},
      roles: input.roles ?? [],
    });

    const {
      _id,
      email,
      displayName,
      avatarUrl,
      calorieTarget,
      macroTargets,
      preferences,
      roles,
    } = doc.toObject();
    return {
      _id,
      email,
      displayName,
      avatarUrl,
      calorieTarget,
      macroTargets,
      preferences,
      roles,
    };
  }

  async updateById(userId: string, dto: UpdateProfileDto) {
    const _id = new Types.ObjectId(userId);

    const $set: Record<string, unknown> = {};

    // прості поля
    if (dto.displayName !== undefined) $set['displayName'] = dto.displayName;
    if (dto.avatarUrl !== undefined) $set['avatarUrl'] = dto.avatarUrl;
    if (dto.calorieTarget !== undefined)
      $set['calorieTarget'] = dto.calorieTarget;

    // macroTargets
    if (dto.protein !== undefined) $set['macroTargets.protein'] = dto.protein;
    if (dto.fat !== undefined) $set['macroTargets.fat'] = dto.fat;
    if (dto.carb !== undefined) $set['macroTargets.carb'] = dto.carb;

    // preferences
    if (dto.units !== undefined) $set['preferences.units'] = dto.units;
    if (dto.weekStart !== undefined)
      $set['preferences.weekStart'] = dto.weekStart;
    if (dto.theme !== undefined) $set['preferences.theme'] = dto.theme;
    if (dto.dietary !== undefined && Array.isArray(dto.dietary)) {
      $set['preferences.dietary'] = dto.dietary;
    }
    if (dto.allergens !== undefined && Array.isArray(dto.allergens)) {
      $set['preferences.allergens'] = dto.allergens;
    }

    const update: UpdateQuery<User> = { $set };

    const res = await this.model
      .findByIdAndUpdate(_id, update, { new: true })
      .select({
        email: 1,
        displayName: 1,
        avatarUrl: 1,
        calorieTarget: 1,
        macroTargets: 1,
        preferences: 1,
      })
      .lean()
      .exec();

    if (!res) throw new NotFoundException('User not found');
    return res;
  }
}
