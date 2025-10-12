import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

// Локальні типи для часткових оновлень без any
type MacroTargetsShape = {
  protein?: number;
  fat?: number;
  carb?: number;
};

type PreferencesShape = {
  units?: 'metric' | 'imperial';
  weekStart?: 'monday' | 'sunday';
  theme?: 'light' | 'dark' | 'system';
  dietary?: string[];
  allergens?: string[];
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<User>) {}

  getByIdLean(userId: string) {
    return this.model
      .findById(new Types.ObjectId(userId))
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
  }

  async updateById(userId: string, dto: UpdateProfileDto) {
    const _id = new Types.ObjectId(userId);

    const update: Partial<User> = {};

    // Прості поля
    if (dto.displayName !== undefined) {
      update.displayName = dto.displayName;
    }
    if (dto.avatarUrl !== undefined) {
      update.avatarUrl = dto.avatarUrl;
    }
    if (dto.calorieTarget !== undefined) {
      update.calorieTarget = dto.calorieTarget;
    }

    // macroTargets
    const macro: MacroTargetsShape = {};
    if (dto.protein !== undefined) macro.protein = dto.protein;
    if (dto.fat !== undefined) macro.fat = dto.fat;
    if (dto.carb !== undefined) macro.carb = dto.carb;
    if (Object.keys(macro).length > 0) {
      update.macroTargets = { ...macro } as User['macroTargets'];
    }

    // preferences
    const pref: PreferencesShape = {};
    if (dto.units !== undefined) pref.units = dto.units;
    if (dto.weekStart !== undefined) pref.weekStart = dto.weekStart;
    if (dto.theme !== undefined) pref.theme = dto.theme;
    if (dto.dietary !== undefined) pref.dietary = dto.dietary;
    if (dto.allergens !== undefined) pref.allergens = dto.allergens;
    if (Object.keys(pref).length > 0) {
      update.preferences = { ...pref } as User['preferences'];
    }

    const res = await this.model
      .findByIdAndUpdate(_id, { $set: update }, { new: true })
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
