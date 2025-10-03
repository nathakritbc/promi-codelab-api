import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePromotionsTable1756391700004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'promotions',
        columns: [
          {
            name: 'uuid',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'draft'",
            isNullable: false,
          },
          {
            name: 'starts_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'ends_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'discount_type',
            type: 'varchar',
            length: '50',
            default: "'Percent'",
            isNullable: false,
          },
          {
            name: 'discount_value',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'max_discount_amount',
            type: 'int',
            default: 0,
            isNullable: true,
          },
          {
            name: 'priority',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes for better query performance using raw SQL with IF NOT EXISTS
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_PROMOTIONS_STATUS" ON "promotions" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_PROMOTIONS_DISCOUNT_TYPE" ON "promotions" ("discount_type")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_PROMOTIONS_STARTS_AT" ON "promotions" ("starts_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_PROMOTIONS_ENDS_AT" ON "promotions" ("ends_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_PROMOTIONS_STATUS_PRIORITY" ON "promotions" ("status", "priority")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_PROMOTIONS_CREATED_AT" ON "promotions" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first using raw SQL with IF EXISTS
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PROMOTIONS_STATUS"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PROMOTIONS_DISCOUNT_TYPE"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PROMOTIONS_STARTS_AT"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PROMOTIONS_ENDS_AT"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PROMOTIONS_STATUS_PRIORITY"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PROMOTIONS_CREATED_AT"`);

    // Drop table
    await queryRunner.dropTable('promotions');
  }
}
