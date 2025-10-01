import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from 'typeorm';

export class CreatePromotionApplicableCategoriesTable1759335819053 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'promotion_applicable_categories',
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
            name: 'category_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'include_children',
            type: 'boolean',
            default: true,
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

    // Create unique constraint for promotion_id + category_id combination
    await queryRunner.createUniqueConstraint(
      'promotion_applicable_categories',
      new TableUnique({
        name: 'UQ_PROMOTION_APPLICABLE_CATEGORIES_PROMOTION_CATEGORY',
        columnNames: ['promotion_id', 'category_id'],
      }),
    );

    // ✅ OPTIMIZED INDEXES - Following ai-index-optimization-spec.md

    // Foreign key indexes for joins and lookups
    await queryRunner.createIndex(
      'promotion_applicable_categories',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_CATEGORIES_PROMOTION_ID',
        columnNames: ['promotion_id'],
      }),
    );

    await queryRunner.createIndex(
      'promotion_applicable_categories',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_CATEGORIES_CATEGORY_ID',
        columnNames: ['category_id'],
      }),
    );

    // Status filter index (needed for status-only queries)
    // Note: Composite indexes (promotion_id, status) and (category_id, status)
    // don't cover status-only queries efficiently
    await queryRunner.createIndex(
      'promotion_applicable_categories',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_CATEGORIES_STATUS',
        columnNames: ['status'],
      }),
    );

    // Composite index for promotion + status queries
    await queryRunner.createIndex(
      'promotion_applicable_categories',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_CATEGORIES_PROMOTION_ID_STATUS',
        columnNames: ['promotion_id', 'status'],
      }),
    );

    // Composite index for category + status queries
    await queryRunner.createIndex(
      'promotion_applicable_categories',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_CATEGORIES_CATEGORY_ID_STATUS',
        columnNames: ['category_id', 'status'],
      }),
    );

    // Sorting index
    await queryRunner.createIndex(
      'promotion_applicable_categories',
      new TableIndex({
        name: 'IDX_PROMOTION_APPLICABLE_CATEGORIES_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('promotion_applicable_categories', 'IDX_PROMOTION_APPLICABLE_CATEGORIES_PROMOTION_ID');
    await queryRunner.dropIndex('promotion_applicable_categories', 'IDX_PROMOTION_APPLICABLE_CATEGORIES_CATEGORY_ID');
    await queryRunner.dropIndex('promotion_applicable_categories', 'IDX_PROMOTION_APPLICABLE_CATEGORIES_STATUS');
    await queryRunner.dropIndex(
      'promotion_applicable_categories',
      'IDX_PROMOTION_APPLICABLE_CATEGORIES_PROMOTION_ID_STATUS',
    );
    await queryRunner.dropIndex(
      'promotion_applicable_categories',
      'IDX_PROMOTION_APPLICABLE_CATEGORIES_CATEGORY_ID_STATUS',
    );
    await queryRunner.dropIndex('promotion_applicable_categories', 'IDX_PROMOTION_APPLICABLE_CATEGORIES_CREATED_AT');

    // Drop unique constraint
    await queryRunner.dropUniqueConstraint(
      'promotion_applicable_categories',
      'UQ_PROMOTION_APPLICABLE_CATEGORIES_PROMOTION_CATEGORY',
    );

    // Drop table
    await queryRunner.dropTable('promotion_applicable_categories');
  }
}
