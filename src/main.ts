import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { ValidationError } from 'class-validator';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/index.js';

// Load .env before anything else so ARCJET_KEY / ARCJET_MODE / ARCJET_ENV
// are available when ArcjetModule.forRoot() initialises.
import 'dotenv/config';

function formatValidationErrors(
  error: ValidationError,
  parentProperty = '',
): { property: string; message: string }[] {
  const property = parentProperty
    ? `${parentProperty}.${error.property}`
    : error.property;

  const result: { property: string; message: string }[] = [];

  if (error.constraints) {
    for (const message of Object.values(error.constraints)) {
      result.push({ property, message });
    }
  }

  if (error.children && error.children.length > 0) {
    for (const child of error.children) {
      result.push(...formatValidationErrors(child, property));
    }
  }

  return result;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth raw body handling
  });

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.flatMap((error) =>
          formatValidationErrors(error),
        );
        return new BadRequestException(formattedErrors);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
