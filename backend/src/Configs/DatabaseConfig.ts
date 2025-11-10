import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const DatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USERNAME'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging:
      configService.get<string>('NODE_ENV') === 'development'
        ? ['error', 'schema']
        : false,
    ssl:
      configService.get<string>('NODE_ENV') === 'production'
        ? { rejectUnauthorized: false }
        : false,
  };
  console.log('🔌 Database connecting to:', {
    host: config.host,
    port: config.port,
    username: config.username,
    database: config.database,
  });
  return config;
};
