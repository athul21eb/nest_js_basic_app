import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { CreateHackathonDto, UpdateHackathonDto } from './dto/index.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class HackathonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHackathonDto: CreateHackathonDto, authorId: string) {
    const { name, description, startAt, endAt, isActive } = createHackathonDto;

    return this.prisma.hackathon.create({
      data: {
        name,
        description,
        startDate: startAt,
        endDate: endAt,
        isActive: isActive ?? true,
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
  }

  async findAll() {
    return this.prisma.hackathon.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${id} not found`);
    }

    return hackathon;
  }

  async update(id: string, updateHackathonDto: UpdateHackathonDto) {
    await this.findById(id);

    const { name, description, startAt, endAt, isActive } = updateHackathonDto;

    return this.prisma.hackathon.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(startAt !== undefined && { startDate: startAt }),
        ...(endAt !== undefined && { endDate: endAt }),
        ...(isActive !== undefined && { isActive }),
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
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.hackathon.delete({
      where: { id },
    });
  }

  async join(hackathonId: string, userId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${hackathonId} not found`);
    }

    if (!hackathon.isActive) {
      throw new BadRequestException('Hackathon is not active');
    }

    if (new Date() > hackathon.endDate) {
      throw new BadRequestException('Hackathon has already ended');
    }

    const existingParticipant =
      await this.prisma.hackathonParticipant.findUnique({
        where: {
          hackathonId_userId: {
            hackathonId,
            userId,
          },
        },
      });

    if (existingParticipant) {
      throw new BadRequestException('You have already joined this hackathon');
    }

    try {
      return await this.prisma.hackathonParticipant.create({
        data: {
          hackathonId,
          userId,
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('You have already joined this hackathon');
      }
      throw error;
    }
  }
}
