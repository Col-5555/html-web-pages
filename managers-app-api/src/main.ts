import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow the Next.js managers dashboard to call this API from the browser.
  app.enableCors();

  // Validate every request body against its DTO: strip unknown properties
  // (whitelist), reject requests that carry them, and coerce types.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4100 keeps clear of the other apps on this machine (Express API 4000,
  // managers-app 8457/3457).
  await app.listen(process.env.PORT ?? 4100);
}
void bootstrap();
