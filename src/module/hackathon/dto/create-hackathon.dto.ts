import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinDate,
  MinLength,
} from 'class-validator';

export class CreateHackathonDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'name must be at least 5 characters long' })
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(50, { message: 'description must be at least 50 characters long' })
  @MaxLength(1000, {
    message: 'description must be at most 1000 characters long',
  })
  description?: string;

  @Type(() => Date)
  @IsDate({ message: 'startAt must be a valid date' })
  @MinDate(() => new Date(), { message: 'startAt must be a future date' })
  startAt: Date;

  @Type(() => Date)
  @IsDate({ message: 'endAt must be a valid date' })
  @MinDate(() => new Date(), { message: 'endAt must be a future date' })
  endAt: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export { CreateHackathonDto as HackathonDto };
