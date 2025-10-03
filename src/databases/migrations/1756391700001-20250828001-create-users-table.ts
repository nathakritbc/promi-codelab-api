import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1756391900901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'uuid',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes for better performance using raw SQL with IF NOT EXISTS
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_USERS_EMAIL" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_USERS_CREATED_AT" ON "users" ("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first using raw SQL with IF EXISTS
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USERS_EMAIL"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USERS_CREATED_AT"`);

    // Drop table
    await queryRunner.dropTable('users');
  }
}
