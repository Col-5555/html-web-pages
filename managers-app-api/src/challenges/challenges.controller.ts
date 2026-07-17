import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

// Challenge management for the acting manager. NOTE: the manager id is read from
// an `x-manager-id` header for now — a placeholder so CRUD is testable before the
// auth phase, which replaces it with the id extracted from the JWT via the
// @AuthenticatedUser() decorator + AuthGuard.
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  create(
    @Body() dto: CreateChallengeDto,
    @Headers('x-manager-id') managerId: string,
  ) {
    return this.challengesService.create(dto, managerId);
  }

  @Get()
  findAll(@Headers('x-manager-id') managerId: string) {
    return this.challengesService.findAll(managerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-manager-id') managerId: string) {
    return this.challengesService.findOne(id, managerId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChallengeDto,
    @Headers('x-manager-id') managerId: string,
  ) {
    return this.challengesService.update(id, dto, managerId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-manager-id') managerId: string) {
    return this.challengesService.remove(id, managerId);
  }
}
