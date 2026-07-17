import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Challenge } from '../schemas/challenge.schema';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

// Challenge CRUD, always scoped to the acting manager: a manager only ever sees
// or mutates the challenges they authored.
@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel(Challenge.name) private readonly challengeModel: Model<Challenge>,
  ) {}

  // Map the request shape (level / code_text[].text / tests[].output) onto the
  // stored schema (difficulty / content / expected_output). Only maps fields that
  // are present, so it serves both create (full) and update (partial).
  private mapToSchema(dto: Partial<CreateChallengeDto>): Record<string, unknown> {
    const doc: Record<string, unknown> = {};
    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.category !== undefined) doc.category = dto.category;
    if (dto.description !== undefined) doc.description = dto.description;
    if (dto.level !== undefined) doc.difficulty = dto.level;
    if (dto.code !== undefined) {
      doc.code = {
        function_name: dto.code.function_name,
        code_text: dto.code.code_text.map((c) => ({ language: c.language, content: c.text })),
        inputs: dto.code.inputs,
      };
    }
    if (dto.tests !== undefined) {
      doc.tests = dto.tests.map((t) => ({
        weight: t.weight,
        inputs: t.inputs,
        expected_output: t.output,
      }));
    }
    return doc;
  }

  create(dto: CreateChallengeDto, managerId: string) {
    return this.challengeModel.create({ ...this.mapToSchema(dto), manager: managerId });
  }

  findAll(managerId: string) {
    return this.challengeModel.find({ manager: managerId }).exec();
  }

  async findOne(id: string, managerId: string) {
    if (!isValidObjectId(id)) throw new NotFoundException(`Challenge ${id} not found`);
    const challenge = await this.challengeModel.findOne({ _id: id, manager: managerId }).exec();
    if (!challenge) throw new NotFoundException(`Challenge ${id} not found`);
    return challenge;
  }

  async update(id: string, dto: UpdateChallengeDto, managerId: string) {
    if (!isValidObjectId(id)) throw new NotFoundException(`Challenge ${id} not found`);
    const challenge = await this.challengeModel
      .findOneAndUpdate({ _id: id, manager: managerId }, this.mapToSchema(dto), {
        new: true,
        runValidators: true,
      })
      .exec();
    if (!challenge) throw new NotFoundException(`Challenge ${id} not found`);
    return challenge;
  }

  async remove(id: string, managerId: string) {
    if (!isValidObjectId(id)) throw new NotFoundException(`Challenge ${id} not found`);
    const challenge = await this.challengeModel
      .findOneAndDelete({ _id: id, manager: managerId })
      .exec();
    if (!challenge) throw new NotFoundException(`Challenge ${id} not found`);
    return { deleted: true, id };
  }
}
