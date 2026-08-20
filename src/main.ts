import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/index.js';

// Load .env before anything else so ARCJET_KEY / ARCJET_MODE / ARCJET_ENV
// are available when ArcjetModule.forRoot() initialises.
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth raw body handling
  });

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
