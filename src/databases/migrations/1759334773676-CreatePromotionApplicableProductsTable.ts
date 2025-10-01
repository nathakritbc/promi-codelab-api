import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from 'typeorm';

export class CreatePromotionApplicableProductsTable1759334773676 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'promotion_applicable_products',
        columns: [
          {
            name: 'uuid',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'promotion_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
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

    // Create unique constraint for promotion_id + product_id combination
    await queryRunner.createUniqueConstraint(
      'promotion_applicable_products',
      new TableUnique({
        name: 'UQ_PROMOTION_APPLICABLE_PRODUCTS_PROMOTION_PRODUCT',
        columnNames: ['promotion_id', 'product_id'],
      }),
    );

    // ✅ OPTIMIZED INDEXES - Following ai-index-optimization-spec.md

    // Foreign key indexes for joins and lookups
    await queryRunner.createIndex(
      'promotion_applicable_products',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_PRODUCTS_PROMOTION_ID',
        columnNames: ['promotion_id'],
      }),
    );

    await queryRunner.createIndex(
      'promotion_applicable_products',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_PRODUCTS_PRODUCT_ID',
        columnNames: ['product_id'],
      }),
    );

    // Status filter index (needed for status-only queries)
    // Note: Composite indexes (promotion_id, status) and (product_id, status)
    // don't cover status-only queries efficiently
    await queryRunner.createIndex(
      'promotion_applicable_products',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_PRODUCTS_STATUS',
        columnNames: ['status'],
      }),
    );

    // Composite index for promotion + status queries
    await queryRunner.createIndex(
      'promotion_applicable_products',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_PRODUCTS_PROMOTION_ID_STATUS',
        columnNames: ['promotion_id', 'status'],
      }),
    );

    // Composite index for product + status queries
    await queryRunner.createIndex(
      'promotion_applicable_products',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_PRODUCTS_PRODUCT_ID_STATUS',
        columnNames: ['product_id', 'status'],
      }),
    );

    // Sorting index
    await queryRunner.createIndex(
      'promotion_applicable_products',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_PRODUCTS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('promotion_applicable_products', 'IDX_PROMOTION_APPLICABLE_PRODUCTS_PROMOTION_ID');
    await queryRunner.dropIndex('promotion_applicable_products', 'IDX_PROMOTION_APPLICABLE_PRODUCTS_PRODUCT_ID');
    await queryRunner.dropIndex('promotion_applicable_products', 'IDX_PROMOTION_APPLICABLE_PRODUCTS_STATUS');
    await queryRunner.dropIndex(
      'promotion_applicable_products',
      'IDX_PROMOTION_APPLICABLE_PRODUCTS_PROMOTION_ID_STATUS',
    );
    await queryRunner.dropIndex('promotion_applicable_products', 'IDX_PROMOTION_APPLICABLE_PRODUCTS_PRODUCT_ID_STATUS');
    await queryRunner.dropIndex('promotion_applicable_products', 'IDX_PROMOTION_APPLICABLE_PRODUCTS_CREATED_AT');

    // Drop unique constraint
    await queryRunner.dropUniqueConstraint(
      'promotion_applicable_products',
      'UQ_PROMOTION_APPLICABLE_PRODUCTS_PROMOTION_PRODUCT',
    );

    // Drop table
    await queryRunner.dropTable('promotion_applicable_products');
  }
}
