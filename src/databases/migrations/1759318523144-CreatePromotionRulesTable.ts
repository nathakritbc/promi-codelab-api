import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePromotionRulesTable1759318523144 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'promotion_rules',
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
            name: 'scope',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'min_qty',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'min_amount',
            type: 'int',
            isNullable: true,
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

    // Create Foreign Key relationship with promotions table
    await queryRunner.createForeignKey(
      'promotion_rules',
      new TableForeignKey({
        name: 'FK_PROMOTION_RULES_PROMOTION_ID',
        columnNames: ['promotion_id'],
        referencedTableName: 'promotions',
        referencedColumnNames: ['uuid'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    // Note: IDX_PROMOTION_RULES_PROMOTION_ID was removed as redundant
    // The composite index IDX_PROMOTION_RULES_PROMOTION_SCOPE can be used for promotion_id queries

    await queryRunner.createIndex(
      'promotion_rules',
      new TableIndex({
        name: 'IDX_PROMOTION_RULES_SCOPE',
        columnNames: ['scope'],
      }),
    );

    await queryRunner.createIndex(
      'promotion_rules',
      new TableIndex({
        name: 'IDX_PROMOTION_RULES_PROMOTION_SCOPE',
        columnNames: ['promotion_id', 'scope'],
      }),
    );

    await queryRunner.createIndex(
      'promotion_rules',
      new TableIndex({
        name: 'IDX_PROMOTION_RULES_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    // IDX_PROMOTION_RULES_PROMOTION_ID was removed as redundant
    await queryRunner.dropIndex('promotion_rules', 'IDX_PROMOTION_RULES_SCOPE');
    await queryRunner.dropIndex('promotion_rules', 'IDX_PROMOTION_RULES_PROMOTION_SCOPE');
    await queryRunner.dropIndex('promotion_rules', 'IDX_PROMOTION_RULES_CREATED_AT');

    // Drop Foreign Key
    await queryRunner.dropForeignKey('promotion_rules', 'FK_PROMOTION_RULES_PROMOTION_ID');

    // Drop table
    await queryRunner.dropTable('promotion_rules');
  }
}
