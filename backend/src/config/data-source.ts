/**
 * Standalone TypeORM DataSource — used by the `typeorm` CLI for
 * `migration:generate`, `migration:run`, `migration:revert`, `migration:show`.
 *
 * Not imported by the NestJS runtime — the runtime uses `typeOrmConfig`
 * (which calls the same `buildDataSourceOptions` builder, so config can never
 * drift between CLI and runtime).
 *
 * Load order:
 *   1. dotenv pulls `.env` (or `DATABASE_ENV_FILE`) into `process.env`
 *   2. `buildDataSourceOptions(process.env)` returns the shared options
 *   3. Export a `DataSource` for the CLI to pick up via `-d`
 */
import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './data-source-options';

const envFile = process.env.DATABASE_ENV_FILE ?? '.env';
loadEnv({ path: envFile });

const envSource = {
  get: <T = string>(key: string): T | undefined =>
    process.env[key] as T | undefined,
};

/**
 * Default export only. The TypeORM CLI scans this module for exports that are
 * `instanceof DataSource` and refuses to start if it finds more than one — so
 * we MUST NOT also `export const AppDataSource = ...` here. Consumers that
 * want a named import use `src/config/index.ts`, which re-exports the default
 * as `AppDataSource`.
 */
export default new DataSource(buildDataSourceOptions(envSource));
