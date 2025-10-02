import { MigrationInterface, QueryRunner } from 'typeorm';

export class CategoriesAncestorsArray1759371525447 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN IF NOT EXISTS "ancestors" uuid[] DEFAULT NULL
    `);

    await queryRunner.query(`
      UPDATE "categories" c
      SET "ancestors" = ARRAY(
        SELECT p."uuid"
        FROM "categories" p
        WHERE p."lft" < c."lft" AND p."rgt" > c."rgt"
        ORDER BY p."lft"
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
      ALTER COLUMN "ancestors" SET DEFAULT '{}'::uuid[],
      ALTER COLUMN "ancestors" SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_CATEGORIES_ANCESTORS_GIN"
      ON "categories" USING GIN ("ancestors")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_CATEGORIES_SINGLE_ROOT"
      ON "categories" ((true))
      WHERE "parent_id" IS NULL
    `);

    await queryRunner.query(`DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_CATEGORIES_RGT') THEN
          DROP INDEX "IDX_CATEGORIES_RGT";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_CATEGORIES_LFT_RGT') THEN
          DROP INDEX "IDX_CATEGORIES_LFT_RGT";
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
      DROP COLUMN IF EXISTS "lft",
      DROP COLUMN IF EXISTS "rgt"
    `);
  }

  public async down(_: QueryRunner): Promise<void> {}
}
