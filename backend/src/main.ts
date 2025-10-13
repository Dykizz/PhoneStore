import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import * as qs from 'qs';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình qs parser cho Express
  app
    .getHttpAdapter()
    .getInstance()
    .set('query parser', (str: string) => {
      return qs.parse(str, {
        parseArrays: true,
        allowDots: true,
        depth: 10,
        arrayLimit: 100,
      });
    });
  // Use helmet for security
  app.use(helmet());
  // Parse cookies
  app.use(cookieParser());
  // Enable CORS
  const allowedOrigins = [
    process.env.HOST_CLIENT,
    process.env.HOST_ADMIN,
    process.env.HOST_ADMIN1,
    process.env.HOST_CLIENT1,
  ].filter(Boolean);
  app.enableCors({
    exposedHeaders: 'Content-Disposition',
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent
  });
  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  const reflector = app.get(Reflector);
  // Global guard for JWT authentication
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  // Global interceptor for response transformation
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  // Global filter for handling exceptions
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Listening on port: ${process.env.PORT ?? 3000}`);
}
bootstrap();
