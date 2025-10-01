import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddForeignKeyToCategoriesParentId1759337162032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add self-referencing foreign key constraint for parent_id -> categories.uuid
    await queryRunner.createForeignKey(
      'categories',
      new TableForeignKey({
        name: 'FK_CATEGORIES_PARENT_ID',
        columnNames: ['parent_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['uuid'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.dropForeignKey('categories', 'FK_CATEGORIES_PARENT_ID');
  }
}
