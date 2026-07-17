import { PartialType } from '@nestjs/mapped-types';
import { CreateChallengeDto } from './create-challenge.dto';

// Update payload: every field of the create DTO becomes optional. A nested
// object (code / tests), if present, must still be fully valid.
export class UpdateChallengeDto extends PartialType(CreateChallengeDto) {}
