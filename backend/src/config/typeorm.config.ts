import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  database: configService.get<string>('DATABASE_NAME'),
  username: configService.get<string>('DATABASE_USER'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
  // synchronize: configService.get<string>('NODE_ENV') === 'Development',
  logging: configService.get<string>('NODE_ENV') === 'Development',
});
