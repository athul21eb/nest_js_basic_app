import {
  ArcjetGuard,
  ArcjetModule,
  detectBot,
  fixedWindow,
  shield,
} from '@arcjet/nest';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './lib/database/prisma.module.js';
import { auth } from './lib/auth/auth.js';
import { UserModule } from './module/user/user.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule.forRoot({ auth }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        // Shield protects your app from common attacks e.g. SQL injection
        shield({ mode: 'LIVE' }),
        // Detect and block malicious bots while allowing dev tools (Postman, curl), search engines, and browsers
        detectBot({
          mode: 'LIVE',
          allow: [
            'CATEGORY:TOOL', // Allows Postman, curl, Insomnia, httpie, wget, etc.
            'CATEGORY:SEARCH_ENGINE', // Allows Google, Bing, etc.
            'CATEGORY:PREVIEW', // Allows Slack, Discord link previews
            'CATEGORY:MONITOR', // Allows uptime monitors
          ],
        }),
        // Fixed window rate limit
        fixedWindow({
          mode: 'LIVE',
          window: '60s',
          max: 100,
        }),
      ],
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
export class AppModule {}
