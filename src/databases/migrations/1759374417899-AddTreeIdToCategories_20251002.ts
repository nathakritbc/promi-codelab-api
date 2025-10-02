import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTreeIdToCategories1759374417899 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) เพิ่มคอลัมน์ tree_id (ให้ NULL ได้ชั่วคราวเพื่อ backfill)
    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN IF NOT EXISTS "tree_id" uuid
    `);

    // 2) BACKFILL tree_id:
    // กรณีมี ancestors แล้ว: ใช้ root = COALESCE(ancestors[1], uuid)
    // - ถ้าเป็น root เอง ancestors ว่าง → ใช้ uuid ของแถวเองเป็น tree_id
    // - ถ้าเป็นลูก → root คือ ancestors[1]
    await queryRunner.query(`
      UPDATE "categories" c
      SET "tree_id" = COALESCE(c.ancestors[1], c."uuid")
      WHERE "tree_id" IS NULL
    `);

    // 3) บังคับ NOT NULL
    await queryRunner.query(`
      ALTER TABLE "categories"
      ALTER COLUMN "tree_id" SET NOT NULL
    `);

    // 4) ลบ unique index แบบ single-root เดิม (ถ้ามี)
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_CATEGORIES_SINGLE_ROOT"`);

    // 5) สร้างดัชนีสำหรับ multi-tree
    // 5.1 root เดียวต่อ tree (parent_id IS NULL)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ONE_ROOT_PER_TREE"
      ON "categories" ("tree_id")
      WHERE "parent_id" IS NULL
    `);

    // 5.2 คิวรีลูกระดับเดียวภายใน tree
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_CAT_TREE_PARENT"
      ON "categories" ("tree_id","parent_id")
    `);

    // 5.3 ดัชนีช่วยเทียบ ancestors (ให้คงไว้ด้วย) — ใช้ bitmap-AND กับ tree_id ได้
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_CATEGORIES_ANCESTORS_GIN"
      ON "categories" USING GIN ("ancestors")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ย้อนกลับไป single-root (ทั้งตารางมี root ได้แค่อันเดียว)
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_ONE_ROOT_PER_TREE"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_CAT_TREE_PARENT"`);

    // index ancestors ยังมีได้ ไม่เป็นปัญหา
    // (ถ้าอยากลบด้วย ให้ปลดคอมเมนต์บรรทัดถัดไป)
    // await queryRunner.query(`DROP INDEX IF EXISTS "IDX_CATEGORIES_ANCESTORS_GIN"`);

    // สร้าง unique single-root กลับ
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_CATEGORIES_SINGLE_ROOT"
      ON "categories" ((true))
      WHERE "parent_id" IS NULL
    `);

    // เอา tree_id ออก (ทำท้ายสุด)
    await queryRunner.query(`
      ALTER TABLE "categories"
      DROP COLUMN IF EXISTS "tree_id"
    `);
  }
}
