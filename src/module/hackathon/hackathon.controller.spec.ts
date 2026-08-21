import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { HackathonController } from './hackathon.controller.js';
import { HackathonService } from './hackathon.service.js';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

describe('HackathonController', () => {
  let controller: HackathonController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      join: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonController],
      providers: [
        {
          provide: HackathonService,
          useValue: serviceMock,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<HackathonController>(HackathonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a hackathon with current user id', async () => {
    const dto = {
      name: 'Hackathon 2026',
      startAt: new Date(),
      endAt: new Date(),
    };
    const session = {
      user: { id: 'admin-user-id' },
    } as unknown as UserSession;

    serviceMock.create.mockResolvedValue({ id: 'hack-1', ...dto, authorId: 'admin-user-id' });

    const result = await controller.create(dto as any, session);
    expect(serviceMock.create).toHaveBeenCalledWith(dto, 'admin-user-id');
    expect(result.id).toBe('hack-1');
  });

  it('should find all hackathons', async () => {
    serviceMock.findAll.mockResolvedValue([{ id: 'hack-1' }]);

    const result = await controller.findAll();
    expect(serviceMock.findAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'hack-1' }]);
  });

  it('should find hackathon by id', async () => {
    serviceMock.findById.mockResolvedValue({ id: 'hack-1' });

    const result = await controller.findById('hack-1');
    expect(serviceMock.findById).toHaveBeenCalledWith('hack-1');
    expect(result).toEqual({ id: 'hack-1' });
  });

  it('should update hackathon', async () => {
    serviceMock.update.mockResolvedValue({ id: 'hack-1', name: 'Updated' });

    const result = await controller.update('hack-1', { name: 'Updated' });
    expect(serviceMock.update).toHaveBeenCalledWith('hack-1', { name: 'Updated' });
    expect(result).toEqual({ id: 'hack-1', name: 'Updated' });
  });

  it('should delete hackathon', async () => {
    serviceMock.delete.mockResolvedValue({ id: 'hack-1' });

    const result = await controller.delete('hack-1');
    expect(serviceMock.delete).toHaveBeenCalledWith('hack-1');
    expect(result).toEqual({ id: 'hack-1' });
  });

  it('should join hackathon for participant', async () => {
    const session = {
      user: { id: 'participant-1' },
    } as unknown as UserSession;
    const mockResult = {
      id: 'part-1',
      hackathonId: 'hack-1',
      userId: 'participant-1',
    };
    serviceMock.join.mockResolvedValue(mockResult);

    const result = await controller.join('hack-1', session);
    expect(serviceMock.join).toHaveBeenCalledWith('hack-1', 'participant-1');
    expect(result).toEqual(mockResult);
  });
});

