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
import {
  AllowAnonymous,
  AuthGuard,
  Roles,
  Session,
} from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Role } from '../../generated/prisma/enums.js';
import { ResponseMessage } from '../../common/index.js';
import { HackathonService } from './hackathon.service.js';
import { CreateHackathonDto, UpdateHackathonDto } from './dto/index.js';

@Controller('hackathon')
@UseGuards(AuthGuard)
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @Post()
  @Roles([Role.ADMIN])
  @ResponseMessage('Hackathon created successfully')
  async create(
    @Body() createHackathonDto: CreateHackathonDto,
    @Session() session: UserSession,
  ) {
    return this.hackathonService.create(createHackathonDto, session.user.id);
  }

  @Get()
  @AllowAnonymous()
  @ResponseMessage('All hackathons fetched successfully')
  async findAll() {
    return this.hackathonService.findAll();
  }

  @Get(':id')
  @AllowAnonymous()
  @ResponseMessage('Hackathon fetched successfully')
  async findById(@Param('id') id: string) {
    return this.hackathonService.findById(id);
  }

  @Patch(':id')
  @Roles([Role.ADMIN])
  @ResponseMessage('Hackathon updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateHackathonDto: UpdateHackathonDto,
  ) {
    return this.hackathonService.update(id, updateHackathonDto);
  }

  @Delete(':id')
  @Roles([Role.ADMIN])
  @ResponseMessage('Hackathon deleted successfully')
  async delete(@Param('id') id: string) {
    return this.hackathonService.delete(id);
  }

  @Post(':id/join')
  @Roles([Role.PARTICIPANT])
  @ResponseMessage('Successfully joined the hackathon')
  async join(@Param('id') id: string, @Session() session: UserSession) {
    return this.hackathonService.join(id, session.user.id);
  }
}
