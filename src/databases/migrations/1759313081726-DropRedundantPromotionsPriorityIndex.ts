import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropRedundantPromotionsPriorityIndex1759313081726 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop redundant priority index
    // We already have IDX_PROMOTIONS_STATUS_PRIORITY (composite index)
    // which can be used for queries that filter by priority
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PROMOTIONS_PRIORITY"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the index if rollback is needed
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_PROMOTIONS_PRIORITY" ON "promotions" ("priority")
    `);
  }
}
