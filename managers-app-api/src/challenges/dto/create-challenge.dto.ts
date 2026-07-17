import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// The challenge-creation payload. It mirrors the shape the Express backend
// accepts (level / code_text[].text / tests[].output) so both APIs — and the
// managers dashboard that calls them — share one contract; the service maps these
// onto the stored schema fields (difficulty / content / expected_output).
//
// `value`/`output` can be any JSON type, so they carry @IsDefined() rather than a
// type check — that both requires them and keeps the global ValidationPipe's
// `whitelist` from stripping an undecorated property.

class CodeTextDto {
  @IsIn(['py', 'js'])
  language: string;

  @IsString()
  text: string;
}

class InputDefinitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

class CodeDto {
  @IsString()
  @IsNotEmpty()
  function_name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CodeTextDto)
  code_text: CodeTextDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InputDefinitionDto)
  inputs: InputDefinitionDto[];
}

class TestInputDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDefined()
  value: unknown;
}

class TestCaseDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  weight: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestInputDto)
  inputs: TestInputDto[];

  @IsDefined()
  output: unknown;
}

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsIn(['Easy', 'Moderate', 'Hard'])
  level: string;

  @ValidateNested()
  @Type(() => CodeDto)
  code: CodeDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  tests: TestCaseDto[];
}
