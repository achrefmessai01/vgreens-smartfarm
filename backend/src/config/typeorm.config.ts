import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './data-source-options';

/**
 * NestJS TypeORM module options. Delegates to `buildDataSourceOptions` so the
 * runtime connection and the TypeORM CLI (data-source.ts) cannot drift.
 *
 * Behaviour:
 *   - `synchronize: false` — schema changes MUST go through a migration.
 *   - `migrationsRun: false` — migrations are applied by the deploy pipeline
 *     (Fly release_command + GitLab CI), not on app boot. Running on boot
 *     would race across N instances and silently retry failed migrations.
 *   - `autoLoadEntities: true` — picks up entities registered with
 *     `TypeOrmModule.forFeature([...])`, in addition to the file glob.
 *   - `retryAttempts` / `retryDelay` — survive cold-start ordering during
 *     Fly deploys where the DB-side cert/pooler may briefly be unresolvable.
 */
export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  ...buildDataSourceOptions(configService),
  autoLoadEntities: true,
  retryAttempts: 5,
  retryDelay: 3000,
});
