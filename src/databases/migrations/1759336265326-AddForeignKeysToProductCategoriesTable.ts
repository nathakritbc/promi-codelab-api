import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddForeignKeysToProductCategoriesTable1759336265326 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key constraint for product_id -> products.uuid
    await queryRunner.createForeignKey(
      'product_categories',
      new TableForeignKey({
        name: 'FK_PRODUCT_CATEGORIES_PRODUCT_ID',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['uuid'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add foreign key constraint for category_id -> categories.uuid
    await queryRunner.createForeignKey(
      'product_categories',
      new TableForeignKey({
        name: 'FK_PRODUCT_CATEGORIES_CATEGORY_ID',
        columnNames: ['category_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['uuid'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.dropForeignKey('product_categories', 'FK_PRODUCT_CATEGORIES_CATEGORY_ID');
    await queryRunner.dropForeignKey('product_categories', 'FK_PRODUCT_CATEGORIES_PRODUCT_ID');
  }
}
