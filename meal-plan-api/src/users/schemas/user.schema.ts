import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true }) email!: string;
  @Prop({ required: true }) passwordHash!: string;
  @Prop() displayName?: string;

  @Prop() calorieTarget?: number;
  @Prop({ type: [String], default: [] }) roles?: string[];
}
export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
