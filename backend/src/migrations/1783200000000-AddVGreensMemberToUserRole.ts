import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the `VGREENS_MEMBER` value to the `users_role_enum` postgres enum used
 * by `users.role`. Pairs with the same value on the backend `UserRole` enum.
 *
 * The role is an internal, read-only version of `VGREENS_ADMIN`: it sees every
 * admin surface and can switch tenants via the navbar, but every write is
 * blocked at the resolver layer (see `RolesGuard`). Two mutations are opted
 * back in for it — alert acknowledgement and CSV export.
 *
 * `ADD VALUE` cannot run inside a transaction on older postgres versions;
 * TypeORM disables the wrapping transaction here by declaring the migration
 * as `transaction = false`. `IF NOT EXISTS` makes the migration idempotent
 * so re-runs in dev/CI don't fail.
 *
 * Enum values cannot be removed in postgres without rebuilding the type, so
 * the `down()` is a best-effort tombstone that recreates the enum without the
 * new value only when no rows still reference it. Rolling back a deployed
 * environment is not expected — the safer path is to leave the value in place
 * and stop assigning it.
 */
export class AddVGreensMemberToUserRole1783200000000 implements MigrationInterface {
  name = 'AddVGreensMemberToUserRole1783200000000';
  transaction = false as const;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'VGREENS_MEMBER'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Safety guard: refuse to downgrade if any user is still on the new role.
    const rows = (await queryRunner.query(
      `SELECT COUNT(*)::text AS count FROM "users" WHERE "role" = 'VGREENS_MEMBER'`,
    )) as { count: string }[];
    if (Number(rows?.[0]?.count ?? '0') > 0) {
      throw new Error(
        'Refusing to remove VGREENS_MEMBER from users_role_enum: users still hold this role.',
      );
    }
    // Rebuild the enum without VGREENS_MEMBER. Postgres won't drop enum
    // values in place, so we create a shadow enum and swap.
    await queryRunner.query(
      `ALTER TYPE "users_role_enum" RENAME TO "users_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "users_role_enum" AS ENUM('TENANT_USER', 'TENANT_ADMIN', 'VGREENS_ADMIN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "users_role_enum" USING "role"::text::"users_role_enum"`,
    );
    await queryRunner.query(`DROP TYPE "users_role_enum_old"`);
  }
}
