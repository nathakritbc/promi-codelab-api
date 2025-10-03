import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropRedundantPromotionRulesPromotionIdIndex1759318853436 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop redundant promotion_id index
    // We already have IDX_PROMOTION_RULES_PROMOTION_SCOPE (composite index)
    // which can be used for queries that filter by promotion_id
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PROMOTION_RULES_PROMOTION_ID"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the index if rollback is needed
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_PROMOTION_RULES_PROMOTION_ID" ON "promotion_rules" ("promotion_id")
    `);
  }
}
