import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCategoriesTable1759329810710 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'categories',
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
            name: 'parent_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'lft',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'rgt',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
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

    // ✅ OPTIMIZED INDEXES - Following ai-index-optimization-spec.md

    // Search index for category name
    await queryRunner.createIndex(
      'categories',
      new TableIndex({
        name: 'IDX_CATEGORIES_NAME',
        columnNames: ['name'],
      }),
    );

    // Note: IDX_CATEGORIES_STATUS was removed as redundant
    // The composite index IDX_CATEGORIES_STATUS_PARENT_ID covers status queries
    // (status is the leading column in the composite index)

    // Parent ID filter index (trailing column in composite, so needed separately)
    await queryRunner.createIndex(
      'categories',
      new TableIndex({
        name: 'IDX_CATEGORIES_PARENT_ID',
        columnNames: ['parent_id'],
      }),
    );

    // Note: IDX_CATEGORIES_LFT was removed as redundant
    // The composite index IDX_CATEGORIES_LFT_RGT covers lft queries
    // (lft is the leading column in the composite index)

    // Right boundary filter index (trailing column in composite, so needed separately)
    await queryRunner.createIndex(
      'categories',
      new TableIndex({
        name: 'IDX_CATEGORIES_RGT',
        columnNames: ['rgt'],
      }),
    );

    // Composite index for most common query: WHERE status AND/OR parent_id filters
    await queryRunner.createIndex(
      'categories',
      new TableIndex({
        name: 'IDX_CATEGORIES_STATUS_PARENT_ID',
        columnNames: ['status', 'parent_id'], // Covers status queries too!
      }),
    );

    // Composite index for nested set queries: WHERE lft AND/OR rgt filters
    await queryRunner.createIndex(
      'categories',
      new TableIndex({
        name: 'IDX_CATEGORIES_LFT_RGT',
        columnNames: ['lft', 'rgt'], // Covers lft queries too!
      }),
    );

    // Sorting index
    await queryRunner.createIndex(
      'categories',
      new TableIndex({
        name: 'IDX_CATEGORIES_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('categories', 'IDX_CATEGORIES_NAME');
    // IDX_CATEGORIES_STATUS was removed as redundant (optimization)
    await queryRunner.dropIndex('categories', 'IDX_CATEGORIES_PARENT_ID');
    // IDX_CATEGORIES_LFT was removed as redundant (optimization)
    await queryRunner.dropIndex('categories', 'IDX_CATEGORIES_RGT');
    await queryRunner.dropIndex('categories', 'IDX_CATEGORIES_STATUS_PARENT_ID');
    await queryRunner.dropIndex('categories', 'IDX_CATEGORIES_LFT_RGT');
    await queryRunner.dropIndex('categories', 'IDX_CATEGORIES_CREATED_AT');

    // Drop table
    await queryRunner.dropTable('categories');
  }
}
