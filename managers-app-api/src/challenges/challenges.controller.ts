import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedUser } from '../auth/authenticated-user.decorator';
import type { AuthUser } from '../auth/authenticated-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

// Challenge management for the acting manager. The whole controller is guarded:
// AuthGuard verifies the JWT and @Roles restricts it to managers; the manager's
// id comes from the verified token via @AuthenticatedUser, and the service scopes
// every operation to challenges that manager authored.
@Controller('challenges')
@UseGuards(AuthGuard)
@Roles('Manager')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  create(@Body() dto: CreateChallengeDto, @AuthenticatedUser() user: AuthUser) {
    return this.challengesService.create(dto, user.id);
  }

  @Get()
  findAll(@AuthenticatedUser() user: AuthUser) {
    return this.challengesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @AuthenticatedUser() user: AuthUser) {
    return this.challengesService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChallengeDto,
    @AuthenticatedUser() user: AuthUser,
  ) {
    return this.challengesService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @AuthenticatedUser() user: AuthUser) {
    return this.challengesService.remove(id, user.id);
  }
}
