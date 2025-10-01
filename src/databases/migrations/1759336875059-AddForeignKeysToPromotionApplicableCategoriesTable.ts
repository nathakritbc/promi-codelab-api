import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddForeignKeysToPromotionApplicableCategoriesTable1759336875059 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key constraint for promotion_id -> promotions.uuid
    await queryRunner.createForeignKey(
      'promotion_applicable_categories',
      new TableForeignKey({
        name: 'FK_PROMOTION_APPLICABLE_CATEGORIES_PROMOTION_ID',
        columnNames: ['promotion_id'],
        referencedTableName: 'promotions',
        referencedColumnNames: ['uuid'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add foreign key constraint for category_id -> categories.uuid
    await queryRunner.createForeignKey(
      'promotion_applicable_categories',
      new TableForeignKey({
        name: 'FK_PROMOTION_APPLICABLE_CATEGORIES_CATEGORY_ID',
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
    await queryRunner.dropForeignKey(
      'promotion_applicable_categories',
      'FK_PROMOTION_APPLICABLE_CATEGORIES_CATEGORY_ID',
    );
    await queryRunner.dropForeignKey(
      'promotion_applicable_categories',
      'FK_PROMOTION_APPLICABLE_CATEGORIES_PROMOTION_ID',
    );
  }
}
