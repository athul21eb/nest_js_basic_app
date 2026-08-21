import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HackathonService } from './hackathon.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';

describe('HackathonService', () => {
  let service: HackathonService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      hackathon: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      hackathonParticipant: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackathonService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<HackathonService>(HackathonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a hackathon with authorId', async () => {
      const dto = {
        name: 'AI Champions Hackathon',
        description: 'A grand hackathon with more than fifty characters in the description field.',
        startAt: new Date(Date.now() + 100000),
        endAt: new Date(Date.now() + 200000),
        isActive: true,
      };
      const authorId = 'user-123';
      const expectedResult = { id: 'hack-1', ...dto, startDate: dto.startAt, endDate: dto.endAt, authorId };

      prismaMock.hackathon.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto, authorId);
      expect(prismaMock.hackathon.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: dto.description,
          startDate: dto.startAt,
          endDate: dto.endAt,
          isActive: true,
          authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all hackathons', async () => {
      const mockList = [{ id: 'hack-1', name: 'Hack 1' }];
      prismaMock.hackathon.findMany.mockResolvedValue(mockList);

      const result = await service.findAll();
      expect(prismaMock.hackathon.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockList);
    });
  });

  describe('findById', () => {
    it('should return a hackathon by id', async () => {
      const mockHackathon = { id: 'hack-1', name: 'Hack 1' };
      prismaMock.hackathon.findUnique.mockResolvedValue(mockHackathon);

      const result = await service.findById('hack-1');
      expect(result).toEqual(mockHackathon);
    });

    it('should throw NotFoundException if hackathon does not exist', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a hackathon', async () => {
      const mockHackathon = { id: 'hack-1', name: 'Hack 1' };
      prismaMock.hackathon.findUnique.mockResolvedValue(mockHackathon);
      prismaMock.hackathon.update.mockResolvedValue({ id: 'hack-1', name: 'Updated Hackathon' });

      const result = await service.update('hack-1', { name: 'Updated Hackathon' });
      expect(prismaMock.hackathon.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated Hackathon');
    });
  });

  describe('delete', () => {
    it('should delete a hackathon', async () => {
      const mockHackathon = { id: 'hack-1', name: 'Hack 1' };
      prismaMock.hackathon.findUnique.mockResolvedValue(mockHackathon);
      prismaMock.hackathon.delete.mockResolvedValue(mockHackathon);

      const result = await service.delete('hack-1');
      expect(prismaMock.hackathon.delete).toHaveBeenCalledWith({ where: { id: 'hack-1' } });
      expect(result).toEqual(mockHackathon);
    });
  });

  describe('join', () => {
    it('should throw NotFoundException if hackathon does not exist', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.join('hack-not-found', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if hackathon is not active', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        isActive: false,
        endDate: new Date(Date.now() + 1000000),
      });

      await expect(service.join('hack-1', 'user-1')).rejects.toThrow(
        'Hackathon is not active',
      );
    });

    it('should throw BadRequestException if hackathon endDate has passed', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        isActive: true,
        endDate: new Date(Date.now() - 100000),
      });

      await expect(service.join('hack-1', 'user-1')).rejects.toThrow(
        'Hackathon has already ended',
      );
    });

    it('should throw BadRequestException if user already joined', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        isActive: true,
        endDate: new Date(Date.now() + 1000000),
      });
      prismaMock.hackathonParticipant.findUnique.mockResolvedValue({
        id: 'part-1',
        hackathonId: 'hack-1',
        userId: 'user-1',
      });

      await expect(service.join('hack-1', 'user-1')).rejects.toThrow(
        'You have already joined this hackathon',
      );
    });

    it('should create and return participant record on valid join', async () => {
      prismaMock.hackathon.findUnique.mockResolvedValue({
        id: 'hack-1',
        isActive: true,
        endDate: new Date(Date.now() + 1000000),
      });
      prismaMock.hackathonParticipant.findUnique.mockResolvedValue(null);
      const mockParticipant = {
        id: 'part-1',
        hackathonId: 'hack-1',
        userId: 'user-1',
        joinedAt: new Date(),
      };
      prismaMock.hackathonParticipant.create.mockResolvedValue(mockParticipant);

      const result = await service.join('hack-1', 'user-1');
      expect(prismaMock.hackathonParticipant.create).toHaveBeenCalledWith({
        data: {
          hackathonId: 'hack-1',
          userId: 'user-1',
        },
        include: {
          hackathon: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
      expect(result).toEqual(mockParticipant);
    });
  });
});
