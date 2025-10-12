import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
class MacroTargets {
  @Prop({ default: 0 }) protein!: number; // г/добу
  @Prop({ default: 0 }) fat!: number; // г/добу
  @Prop({ default: 0 }) carb!: number; // г/добу
}

@Schema({ _id: false })
class Preferences {
  @Prop({ default: 'metric' }) units!: 'metric' | 'imperial';
  @Prop({ default: 'monday' }) weekStart!: 'monday' | 'sunday';
  @Prop({ default: 'system' }) theme!: 'light' | 'dark' | 'system';
  @Prop({ default: [] }) dietary!: string[]; // ['vegan','vegetarian','halal','kosher','keto',...]
  @Prop({ default: [] }) allergens!: string[]; // ['peanut','gluten',...]
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true }) email!: string;
  @Prop({ required: true }) passwordHash!: string;

  @Prop() displayName?: string;
  @Prop() avatarUrl?: string;

  // цілі
  @Prop({ default: 0 }) calorieTarget!: number; // ккал/добу
  @Prop({ type: MacroTargets, default: {} }) macroTargets!: MacroTargets;

  // налаштування
  @Prop({ type: Preferences, default: {} }) preferences!: Preferences;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
