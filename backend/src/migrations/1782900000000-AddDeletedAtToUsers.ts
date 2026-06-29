import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the soft-delete tombstone column to `users`.
 *
 * Pairs with `@DeleteDateColumn` on the User entity. Nullable with no default,
 * so every existing row reads as "not deleted". Once present, TypeORM
 * automatically scopes Repository find/findOne/save with `"deletedAt" IS NULL`,
 * which hides soft-deleted users from User Management, the `me` lookup
 * (`findByClerkUserId`), and every tenant-scoped query — without dropping the
 * row or breaking any FK references (harvest.createdBy, alerts, audit trails).
 *
 * Hard delete is intentionally not exposed via the GraphQL API after this
 * migration; `UsersService.delete` now calls `repository.softDelete`. Restore
 * with `userRepository.restore(id)` if a delete needs to be undone.
 */
export class AddDeletedAtToUsers1782900000000 implements MigrationInterface {
  name = 'AddDeletedAtToUsers1782900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "deletedAt" timestamp`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
  }
}
