import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from './common/index.js';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @AllowAnonymous()
  @ResponseMessage('Greeting fetched successfully')
  getHello(): string {
    return this.appService.getHello();
  }
}
