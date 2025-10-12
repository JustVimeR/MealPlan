import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
class MacroTargets {
  @Prop({ default: 0 }) protein!: number; // g/day
  @Prop({ default: 0 }) fat!: number; // g/day
  @Prop({ default: 0 }) carb!: number; // g/day
}
export const MacroTargetsSchema = SchemaFactory.createForClass(MacroTargets);

@Schema({ _id: false })
class Preferences {
  @Prop({ default: 'metric', enum: ['metric', 'imperial'] })
  units!: 'metric' | 'imperial';

  @Prop({ default: 'monday', enum: ['monday', 'sunday'] })
  weekStart!: 'monday' | 'sunday';

  @Prop({ default: 'system', enum: ['light', 'dark', 'system'] })
  theme!: 'light' | 'dark' | 'system';

  @Prop({ type: [String], default: [] })
  dietary!: string[];

  @Prop({ type: [String], default: [] })
  allergens!: string[];
}
export const PreferencesSchema = SchemaFactory.createForClass(Preferences);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true }) email!: string;
  @Prop({ required: true }) passwordHash!: string;

  @Prop() displayName?: string;
  @Prop() avatarUrl?: string;

  @Prop({ default: 0 }) calorieTarget!: number; // kcal/day

  @Prop({ type: MacroTargetsSchema, default: {} })
  macroTargets!: MacroTargets;

  @Prop({ type: PreferencesSchema, default: {} })
  preferences!: Preferences;

  // ✅ додали ролі
  @Prop({ type: [String], default: [] })
  roles!: string[];
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
