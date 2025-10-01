import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateProductsTable1759320548075 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'uuid',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
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

    // Unique index for product code lookup
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_CODE',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // Note: IDX_PRODUCTS_STATUS was removed as redundant
    // The composite index IDX_PRODUCTS_STATUS_PRICE covers status queries
    // (status is the leading column in the composite index)

    // Price-only filter index (trailing column in composite, so needed separately)
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_PRICE',
        columnNames: ['price'],
      }),
    );

    // Composite index for most common query: WHERE status AND/OR price filters
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_STATUS_PRICE',
        columnNames: ['status', 'price'], // Covers status queries too!
      }),
    );

    // Sorting index
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('products', 'IDX_PRODUCTS_CODE');
    // IDX_PRODUCTS_STATUS was removed as redundant (optimization)
    await queryRunner.dropIndex('products', 'IDX_PRODUCTS_PRICE');
    await queryRunner.dropIndex('products', 'IDX_PRODUCTS_STATUS_PRICE');
    await queryRunner.dropIndex('products', 'IDX_PRODUCTS_CREATED_AT');

    // Drop table
    await queryRunner.dropTable('products');
  }
}
