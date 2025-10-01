import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddForeignKeysToPromotionApplicableProductsTable1759336631142 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key constraint for promotion_id -> promotions.uuid
    await queryRunner.createForeignKey(
      'promotion_applicable_products',
      new TableForeignKey({
        name: 'FK_PROMOTION_APPLICABLE_PRODUCTS_PROMOTION_ID',
        columnNames: ['promotion_id'],
        referencedTableName: 'promotions',
        referencedColumnNames: ['uuid'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add foreign key constraint for product_id -> products.uuid
    await queryRunner.createForeignKey(
      'promotion_applicable_products',
      new TableForeignKey({
        name: 'FK_PROMOTION_APPLICABLE_PRODUCTS_PRODUCT_ID',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['uuid'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.dropForeignKey('promotion_applicable_products', 'FK_PROMOTION_APPLICABLE_PRODUCTS_PRODUCT_ID');
    await queryRunner.dropForeignKey('promotion_applicable_products', 'FK_PROMOTION_APPLICABLE_PRODUCTS_PROMOTION_ID');
  }
}
