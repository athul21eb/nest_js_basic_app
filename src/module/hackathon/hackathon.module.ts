import { Module } from '@nestjs/common';
import { HackathonController } from './hackathon.controller.js';
import { HackathonService } from './hackathon.service.js';

@Module({
  controllers: [HackathonController],
  providers: [HackathonService],
  exports: [HackathonService],
})
export class HackathonModule {}
