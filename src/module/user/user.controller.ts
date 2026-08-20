import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from '@thallesp/nestjs-better-auth';
import { Role } from '../../generated/prisma/enums.js';
import { UserService } from './user.service.js';
import { ResponseMessage } from '../../common/index.js';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  @Roles([Role.ADMIN])
  @ResponseMessage('All users fetched successfully')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
