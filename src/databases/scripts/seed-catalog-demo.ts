#!/usr/bin/env ts-node

import 'dotenv/config';
import { MigrationUtils } from '../migration.utils';

type UUIDRow = { uuid: string };

const PRODUCT_CODES = ['MON-001', 'KEY-001', 'MOU-001'];
const PROMOTION_NAMES = ['Monitor Mega Sale', 'Accessory Happy Hour', 'Keyboard Flash Deal', 'Keyboard Clearance'];
const CATEGORY_NAMES = ['Monitors', 'Computer Accessories'];

function addDays(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now.toISOString();
}

async function seedCatalogDemo() {
  const dataSource = await MigrationUtils.getDataSource();
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('🧹 Cleaning existing demo data...');

    await queryRunner.query(
      `DELETE FROM promotion_applicable_products WHERE product_id IN (SELECT uuid FROM products WHERE code = ANY($1))`,
      [PRODUCT_CODES],
    );
    await queryRunner.query(
      `DELETE FROM promotion_applicable_products WHERE promotion_id IN (SELECT uuid FROM promotions WHERE name = ANY($1))`,
      [PROMOTION_NAMES],
    );
    await queryRunner.query(
      `DELETE FROM promotion_applicable_categories WHERE promotion_id IN (SELECT uuid FROM promotions WHERE name = ANY($1))`,
      [PROMOTION_NAMES],
    );
    await queryRunner.query(
      `DELETE FROM promotion_applicable_categories WHERE category_id IN (SELECT uuid FROM categories WHERE name = ANY($1))`,
      [CATEGORY_NAMES],
    );
    await queryRunner.query(
      `DELETE FROM product_categories WHERE product_id IN (SELECT uuid FROM products WHERE code = ANY($1))`,
      [PRODUCT_CODES],
    );
    await queryRunner.query(`DELETE FROM promotions WHERE name = ANY($1)`, [PROMOTION_NAMES]);
    await queryRunner.query(`DELETE FROM products WHERE code = ANY($1)`, [PRODUCT_CODES]);
    await queryRunner.query(`DELETE FROM categories WHERE name = ANY($1)`, [CATEGORY_NAMES]);

    console.log('🌱 Inserting categories...');
    const monitorCategory = (await queryRunner.query(
      `WITH data AS (SELECT gen_random_uuid() AS id)
       INSERT INTO categories (uuid, name, parent_id, ancestors, tree_id, status)
       SELECT id, $1, NULL, '{}', id, 'active' FROM data
       RETURNING uuid`,
      ['Monitors'],
    ))[0] as UUIDRow;

    const accessoriesCategory = (await queryRunner.query(
      `WITH data AS (SELECT gen_random_uuid() AS id)
       INSERT INTO categories (uuid, name, parent_id, ancestors, tree_id, status)
       SELECT id, $1, NULL, '{}', id, 'active' FROM data
       RETURNING uuid`,
      ['Computer Accessories'],
    ))[0] as UUIDRow;

    console.log('🛒 Inserting products...');
    const monitorProduct = (await queryRunner.query(
      `INSERT INTO products (uuid, code, name, description, price, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'active')
       RETURNING uuid`,
      ['MON-001', '4K Monitor', '27-inch UHD monitor', 12000],
    ))[0] as UUIDRow;

    const keyboardProduct = (await queryRunner.query(
      `INSERT INTO products (uuid, code, name, description, price, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'active')
       RETURNING uuid`,
      ['KEY-001', 'Mechanical Keyboard', 'RGB TKL keyboard', 2500],
    ))[0] as UUIDRow;

    const mouseProduct = (await queryRunner.query(
      `INSERT INTO products (uuid, code, name, description, price, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'active')
       RETURNING uuid`,
      ['MOU-001', 'Wireless Mouse', 'Low-latency wireless mouse', 900],
    ))[0] as UUIDRow;

    console.log('🔗 Linking products to categories...');
    await queryRunner.query(
      `INSERT INTO product_categories (uuid, product_id, category_id, status)
       VALUES (gen_random_uuid(), $1, $2, 'active')`,
      [monitorProduct.uuid, monitorCategory.uuid],
    );
    await queryRunner.query(
      `INSERT INTO product_categories (uuid, product_id, category_id, status)
       VALUES (gen_random_uuid(), $1, $2, 'active')`,
      [keyboardProduct.uuid, accessoriesCategory.uuid],
    );
    await queryRunner.query(
      `INSERT INTO product_categories (uuid, product_id, category_id, status)
       VALUES (gen_random_uuid(), $1, $2, 'active')`,
      [mouseProduct.uuid, accessoriesCategory.uuid],
    );

    console.log('🎯 Inserting promotions...');
    const monitorPromotion = (await queryRunner.query(
      `INSERT INTO promotions (uuid, name, status, starts_at, ends_at, discount_type, discount_value, max_discount_amount, priority)
       VALUES (gen_random_uuid(), $1, 'active', $2::timestamptz, $3::timestamptz, 'Percent', $4, $5, $6)
       RETURNING uuid`,
      ['Monitor Mega Sale', addDays(-1), addDays(365), 15, 1500, 5],
    ))[0] as UUIDRow;

    const accessoryPromotion = (await queryRunner.query(
      `INSERT INTO promotions (uuid, name, status, starts_at, ends_at, discount_type, discount_value, max_discount_amount, priority)
       VALUES (gen_random_uuid(), $1, 'active', $2::timestamptz, $3::timestamptz, 'Fixed', $4, NULL, $5)
       RETURNING uuid`,
      ['Accessory Happy Hour', addDays(-1), addDays(365), 200, 3],
    ))[0] as UUIDRow;

    const keyboardFlashPromotion = (await queryRunner.query(
      `INSERT INTO promotions (uuid, name, status, starts_at, ends_at, discount_type, discount_value, max_discount_amount, priority)
       VALUES (gen_random_uuid(), $1, 'active', $2::timestamptz, $3::timestamptz, 'Percent', $4, NULL, $5)
       RETURNING uuid`,
      ['Keyboard Flash Deal', addDays(-1), addDays(120), 10, 7],
    ))[0] as UUIDRow;

    const keyboardClearancePromotion = (await queryRunner.query(
      `INSERT INTO promotions (uuid, name, status, starts_at, ends_at, discount_type, discount_value, max_discount_amount, priority)
       VALUES (gen_random_uuid(), $1, 'active', $2::timestamptz, $3::timestamptz, 'Fixed', $4, NULL, $5)
       RETURNING uuid`,
      ['Keyboard Clearance', addDays(-1), addDays(60), 400, 4],
    ))[0] as UUIDRow;

    console.log('🧩 Attaching promotions to categories/products...');
    await queryRunner.query(
      `INSERT INTO promotion_applicable_categories (uuid, promotion_id, category_id, include_children, status)
       VALUES (gen_random_uuid(), $1, $2, true, 'active')`,
      [monitorPromotion.uuid, monitorCategory.uuid],
    );

    await queryRunner.query(
      `INSERT INTO promotion_applicable_categories (uuid, promotion_id, category_id, include_children, status)
       VALUES (gen_random_uuid(), $1, $2, false, 'active')`,
      [accessoryPromotion.uuid, accessoriesCategory.uuid],
    );

    await queryRunner.query(
      `INSERT INTO promotion_applicable_products (uuid, promotion_id, product_id, status)
       VALUES (gen_random_uuid(), $1, $2, 'active')`,
      [keyboardFlashPromotion.uuid, keyboardProduct.uuid],
    );

    await queryRunner.query(
      `INSERT INTO promotion_applicable_products (uuid, promotion_id, product_id, status)
       VALUES (gen_random_uuid(), $1, $2, 'active')`,
      [keyboardClearancePromotion.uuid, keyboardProduct.uuid],
    );

    await queryRunner.commitTransaction();

    console.log('✅ Demo catalog data seeded successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Failed to seed catalog demo data:', error);
    process.exitCode = 1;
  } finally {
    await queryRunner.release();
    await MigrationUtils.closeConnection();
  }
}

if (require.main === module) {
  seedCatalogDemo();
}
