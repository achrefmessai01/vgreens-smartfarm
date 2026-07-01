import type { DataSourceOptions } from 'typeorm';
import { join } from 'path';

/**
 * Minimal env-like surface — accepts both `process.env` and a NestJS
 * `ConfigService` (which exposes the same `get(key)` shape), so the same
 * builder powers both the runtime config and the standalone TypeORM CLI.
 */
export interface EnvSource {
  get<T = string>(key: string): T | undefined;
}

/** Normalise `NODE_ENV` — the project mixes "Production"/"production"/etc. */
export function resolveNodeEnv(
  env: EnvSource,
): 'development' | 'test' | 'staging' | 'production' {
  const raw = (env.get<string>('NODE_ENV') ?? 'development').toLowerCase();
  if (raw === 'production' || raw === 'prod') return 'production';
  if (raw === 'staging' || raw === 'stage') return 'staging';
  if (raw === 'test') return 'test';
  return 'development';
}

/**
 * Single source of truth for TypeORM connection options — shared by:
 *   - NestJS runtime (`typeOrmConfig`)
 *   - TypeORM CLI (`data-source.ts`, used by migration:* scripts)
 *
 * Hard rules:
 *   - `synchronize: false` everywhere. Schema changes go through migrations.
 *   - `migrationsRun: false`. Migrations run via deploy pipeline (Fly
 *     `release_command` + GitLab job), never on app boot — keeps the schema
 *     change loud and atomic with deploy, never racing across instances.
 *   - SSL on for hosted Postgres (Supabase). Detected from DATABASE_SSL or
 *     host suffix.
 */
export function buildDataSourceOptions(env: EnvSource): DataSourceOptions {
  const nodeEnv = resolveNodeEnv(env);
  const host = env.get<string>('DATABASE_HOST') ?? 'localhost';
  const port = Number(env.get<string>('DATABASE_PORT') ?? '5432');
  const database = env.get<string>('DATABASE_NAME') ?? 'postgres';
  const username = env.get<string>('DATABASE_USER') ?? 'postgres';
  const password = env.get<string>('DATABASE_PASSWORD') ?? 'postgres';

  const sslExplicit = env.get<string>('DATABASE_SSL');
  const sslOn =
    sslExplicit === 'true' ||
    (sslExplicit !== 'false' &&
      (host.includes('supabase.') ||
        host.includes('rds.amazonaws.com') ||
        host.includes('.fly.dev')));

  // Resolved relative to this file. At runtime this file lives under either
  // `src/config/` (ts-node) or `dist/config/` (compiled). The entity/migration
  // globs follow the same extension as the running file.
  const isCompiled = __filename.endsWith('.js');
  const ext = isCompiled ? 'js' : 'ts';
  const root = join(__dirname, '..');

  return {
    type: 'postgres',
    host,
    port,
    database,
    username,
    password,
    ssl: sslOn ? { rejectUnauthorized: false } : false,
    entities: [join(root, `**/*.entity.${ext}`)],
    migrations: [join(root, `migrations/*.${ext}`)],
    migrationsTableName: 'typeorm_migrations',
    // Each migration runs in its own transaction (TypeORM's default 'all'
    // mode wraps every pending migration in one transaction and refuses
    // per-migration opt-outs). We need per-migration opt-outs because some
    // Postgres DDL cannot run inside a transaction — notably `ALTER TYPE
    // ... ADD VALUE` on older Postgres and `CREATE INDEX CONCURRENTLY`.
    // Those migrations declare `transaction = false`; 'each' honors it.
    migrationsTransactionMode: 'each',
    // Never auto-sync. The only way schema changes reach the DB is via a
    // committed migration. This is the change that closes the prod-risk gap
    // the codebase had under `synchronize: true`.
    synchronize: false,
    // Migrations run via deploy pipeline, not on boot. Setting this to true
    // would race across N app instances and silently re-attempt failed
    // migrations on every restart.
    migrationsRun: false,
    logging: nodeEnv === 'development',
    // Reasonable defaults for hosted Postgres (Supabase pooler). Tune via env.
    extra: {
      max: Number(env.get<string>('DATABASE_POOL_MAX') ?? '10'),
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
    },
  };
}
