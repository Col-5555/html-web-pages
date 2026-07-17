import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// The Manager account. In the Express backend, Manager is a discriminator on the
// shared `users` collection — so this schema is bound to `users` too, and the
// Challenge.manager reference resolves against the same documents. We only read
// managers here (challenges are scoped by manager id); the account itself is
// created/authenticated by the Express backend.
@Schema({ collection: 'users', timestamps: true })
export class Manager {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  role: string;

  @Prop({ default: false })
  is_verified: boolean;
}

export type ManagerDocument = HydratedDocument<Manager>;
export const ManagerSchema = SchemaFactory.createForClass(Manager);
