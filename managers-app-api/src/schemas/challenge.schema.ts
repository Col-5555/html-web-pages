import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

// The Challenge schema, identical in shape to the Express backend's Challenge
// model (both apps share one `challenges` collection). Code and TestCases only
// exist inside a challenge, so they're embedded subdocuments (_id: false); the
// authoring Manager is a reference.

@Schema({ _id: false })
export class CodeText {
  @Prop({ required: true, enum: ['py', 'js'] })
  language: string;

  @Prop({ default: '' })
  content: string;
}
const CodeTextSchema = SchemaFactory.createForClass(CodeText);

@Schema({ _id: false })
export class InputDefinition {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;
}
const InputDefinitionSchema = SchemaFactory.createForClass(InputDefinition);

@Schema({ _id: false })
export class Code {
  @Prop({ required: true })
  function_name: string;

  @Prop({ type: [CodeTextSchema], default: [] })
  code_text: CodeText[];

  @Prop({ type: [InputDefinitionSchema], default: [] })
  inputs: InputDefinition[];
}
const CodeSchema = SchemaFactory.createForClass(Code);

@Schema({ _id: false })
export class InputValue {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  value: unknown;
}
const InputValueSchema = SchemaFactory.createForClass(InputValue);

@Schema({ _id: false })
export class TestCase {
  @Prop({ required: true, min: 0, max: 1 })
  weight: number;

  @Prop({ type: [InputValueSchema], default: [] })
  inputs: InputValue[];

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  expected_output: unknown;
}
const TestCaseSchema = SchemaFactory.createForClass(TestCase);

@Schema({ timestamps: true })
export class Challenge {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['Easy', 'Moderate', 'Hard'] })
  difficulty: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Manager', required: true })
  manager: Types.ObjectId;

  @Prop({ type: CodeSchema, required: true })
  code: Code;

  @Prop({ type: [TestCaseSchema], default: [] })
  tests: TestCase[];
}

export type ChallengeDocument = HydratedDocument<Challenge>;
export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
