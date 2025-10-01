import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

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

    // Create indexes for better query performance
    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'IDX_PROMOTIONS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'IDX_PROMOTIONS_DISCOUNT_TYPE',
        columnNames: ['discount_type'],
      }),
    );

    // Note: IDX_PROMOTIONS_PRIORITY was removed as redundant
    // The composite index IDX_PROMOTIONS_STATUS_PRIORITY can be used for priority queries

    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'IDX_PROMOTIONS_STARTS_AT',
        columnNames: ['starts_at'],
      }),
    );

    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'IDX_PROMOTIONS_ENDS_AT',
        columnNames: ['ends_at'],
      }),
    );

    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'IDX_PROMOTIONS_STATUS_PRIORITY',
        columnNames: ['status', 'priority'],
      }),
    );

    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'IDX_PROMOTIONS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('promotions', 'IDX_PROMOTIONS_STATUS');
    await queryRunner.dropIndex('promotions', 'IDX_PROMOTIONS_DISCOUNT_TYPE');
    // IDX_PROMOTIONS_PRIORITY was removed as redundant
    await queryRunner.dropIndex('promotions', 'IDX_PROMOTIONS_STARTS_AT');
    await queryRunner.dropIndex('promotions', 'IDX_PROMOTIONS_ENDS_AT');
    await queryRunner.dropIndex('promotions', 'IDX_PROMOTIONS_STATUS_PRIORITY');
    await queryRunner.dropIndex('promotions', 'IDX_PROMOTIONS_CREATED_AT');

    // Drop table
    await queryRunner.dropTable('promotions');
  }
}
