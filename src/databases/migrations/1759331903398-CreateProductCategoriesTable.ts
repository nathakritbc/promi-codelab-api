import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from 'typeorm';

export class CreateProductCategoriesTable1759331903398 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_categories',
        columns: [
          {
            name: 'uuid',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'category_id',
            type: 'uuid',
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

    // Create unique constraint for product_id + category_id combination
    await queryRunner.createUniqueConstraint(
      'product_categories',
      new TableUnique({
        name: 'UQ_PRODUCT_CATEGORIES_PRODUCT_CATEGORY',
        columnNames: ['product_id', 'category_id'],
      }),
    );

    // ✅ OPTIMIZED INDEXES - Following ai-index-optimization-spec.md

    // Foreign key indexes for joins and lookups
    await queryRunner.createIndex(
      'product_categories',
      new TableIndex({
        name: 'IDX_PRODUCT_CATEGORIES_PRODUCT_ID',
        columnNames: ['product_id'],
      }),
    );

    await queryRunner.createIndex(
      'product_categories',
      new TableIndex({
        name: 'IDX_PRODUCT_CATEGORIES_CATEGORY_ID',
        columnNames: ['category_id'],
      }),
    );

    // Status filter index (needed for status-only queries)
    // Note: Composite indexes (product_id, status) and (category_id, status)
    // don't cover status-only queries efficiently
    await queryRunner.createIndex(
      'product_categories',
      new TableIndex({
        name: 'IDX_PRODUCT_CATEGORIES_STATUS',
        columnNames: ['status'],
      }),
    );

    // Composite index for product + status queries
    await queryRunner.createIndex(
      'product_categories',
      new TableIndex({
        name: 'IDX_PRODUCT_CATEGORIES_PRODUCT_ID_STATUS',
        columnNames: ['product_id', 'status'],
      }),
    );

    // Composite index for category + status queries
    await queryRunner.createIndex(
      'product_categories',
      new TableIndex({
        name: 'IDX_PRODUCT_CATEGORIES_CATEGORY_ID_STATUS',
        columnNames: ['category_id', 'status'],
      }),
    );

    // Sorting index
    await queryRunner.createIndex(
      'product_categories',
      new TableIndex({
        name: 'IDX_PRODUCT_CATEGORIES_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('product_categories', 'IDX_PRODUCT_CATEGORIES_PRODUCT_ID');
    await queryRunner.dropIndex('product_categories', 'IDX_PRODUCT_CATEGORIES_CATEGORY_ID');
    await queryRunner.dropIndex('product_categories', 'IDX_PRODUCT_CATEGORIES_STATUS');
    await queryRunner.dropIndex('product_categories', 'IDX_PRODUCT_CATEGORIES_PRODUCT_ID_STATUS');
    await queryRunner.dropIndex('product_categories', 'IDX_PRODUCT_CATEGORIES_CATEGORY_ID_STATUS');
    await queryRunner.dropIndex('product_categories', 'IDX_PRODUCT_CATEGORIES_CREATED_AT');

    // Drop unique constraint
    await queryRunner.dropUniqueConstraint('product_categories', 'UQ_PRODUCT_CATEGORIES_PRODUCT_CATEGORY');

    // Drop table
    await queryRunner.dropTable('product_categories');
  }
}
