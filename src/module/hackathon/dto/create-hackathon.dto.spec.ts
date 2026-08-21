import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateHackathonDto } from './create-hackathon.dto.js';

describe('CreateHackathonDto', () => {
  it('should validate successfully with valid data', async () => {
    const futureDate1 = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const futureDate2 = new Date(Date.now() + 1000 * 60 * 60 * 48);

    const plain = {
      name: 'AI Global Hackathon 2026',
      description:
        'This is a valid long description for the upcoming hackathon event testing validations properly.',
      startAt: futureDate1.toISOString(),
      endAt: futureDate2.toISOString(),
      isActive: true,
    };

    const dto = plainToInstance(CreateHackathonDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.startAt).toBeInstanceOf(Date);
    expect(dto.endAt).toBeInstanceOf(Date);
  });

  it('should fail when name has fewer than 5 characters', async () => {
    const plain = {
      name: 'AI',
      startAt: new Date(Date.now() + 100000).toISOString(),
      endAt: new Date(Date.now() + 200000).toISOString(),
    };

    const dto = plainToInstance(CreateHackathonDto, plain);
    const errors = await validate(dto);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError?.constraints?.minLength).toBeDefined();
  });

  it('should fail when description is too short or too long', async () => {
    const plainShort = {
      name: 'Valid Name',
      description: 'Too short',
      startAt: new Date(Date.now() + 100000).toISOString(),
      endAt: new Date(Date.now() + 200000).toISOString(),
    };

    const dtoShort = plainToInstance(CreateHackathonDto, plainShort);
    const errorsShort = await validate(dtoShort);
    const descError = errorsShort.find((e) => e.property === 'description');
    expect(descError).toBeDefined();

    const plainLong = {
      name: 'Valid Name',
      description: 'A'.repeat(1001),
      startAt: new Date(Date.now() + 100000).toISOString(),
      endAt: new Date(Date.now() + 200000).toISOString(),
    };

    const dtoLong = plainToInstance(CreateHackathonDto, plainLong);
    const errorsLong = await validate(dtoLong);
    const descLongError = errorsLong.find((e) => e.property === 'description');
    expect(descLongError).toBeDefined();
  });

  it('should fail when dates are in the past', async () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24);

    const plain = {
      name: 'Valid Name',
      startAt: pastDate.toISOString(),
      endAt: pastDate.toISOString(),
    };

    const dto = plainToInstance(CreateHackathonDto, plain);
    const errors = await validate(dto);

    const startAtError = errors.find((e) => e.property === 'startAt');
    const endAtError = errors.find((e) => e.property === 'endAt');
    expect(startAtError).toBeDefined();
    expect(endAtError).toBeDefined();
  });
});
