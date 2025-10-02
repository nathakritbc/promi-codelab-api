# Database Migrations Guide

เอกสารนี้สรุปวิธีจัดการ schema ของ **Catalog Promotions API** ภายใต้แนวทาง Hexagonal Architecture โดยใช้ TypeORM + custom migrations history

## 🧭 Overview
- ใช้ TypeORM CLI (ผ่านสคริปต์ใน `package.json`) จัดการ migrations
- เก็บไฟล์ migrations ไว้ที่ `src/databases/migrations`
- มีตาราง `migrations_history` สำหรับบันทึกเวลา/ผลการรันแต่ละ migration

## ⚙️ Configuration Files
| File | Description |
|------|-------------|
| `src/configs/typeorm.config.ts` | รวมการตั้งค่าเชื่อมต่อฐานข้อมูล + entities + migrations |
| `src/databases/data-source.ts` | DataSource ที่ CLI ใช้ตอนรัน migrations |

> **ค่าเชื่อมต่อฐานข้อมูล** ดูตัวอย่างใน `env.example`

## 🧾 CLI Commands
ใช้ `pnpm` เป็นหลัก ทุกคำสั่งต้องรันหลัง `pnpm install`

```bash
# สร้าง migration ใหม่จาก entity ที่แก้ไข
pnpm run migration:generate src/databases/migrations/MyMigrationName

# สร้างไฟล์ migration เปล่า
pnpm run migration:create src/databases/migrations/MyMigrationName

# ใช้งานจริง
pnpm run migration:run          # apply migrations ทั้งหมด
pnpm run migration:revert       # rollback migration ล่าสุด
pnpm run migration:show         # list migrations + status

# คำสั่งเสริม
pnpm run schema:drop            # ล้าง schema (dev only)
pnpm run schema:sync            # sync ตาม entity (dev only)

# utility scripts
pnpm run db:reset               # drop + run migrations ใหม่
pnpm run db:status              # ดูสถานะ migrations_history
pnpm run db:stats               # รายงานสถิติการรัน migrations
```

## 📂 Current Migrations (`src/databases/migrations`)
| Timestamp | File | Summary |
|-----------|------|---------|
| 1756391700001 | `20250828001-create-users-table.ts` | ตาราง `users` |
| 1756391700003 | `20250828001-create-custom-migrations-history-table.ts` | ตาราง `migrations_history` สำหรับ tracking |
| 1756391700004 | `20250828001-create-promotions-table.ts` | ตาราง `promotions` + indexes |
| 1759313081726 | `DropRedundantPromotionsPriorityIndex.ts` | cleanup index ซ้ำของ promotions |
| 1759318523144 | `CreatePromotionRulesTable.ts` | ตาราง `promotion_rules` |
| 1759318853436 | `DropRedundantPromotionRulesPromotionIdIndex.ts` | cleanup index promotion_rules |
| 1759320548075 | `CreateProductsTable.ts` | ตาราง `products` + indexes |
| 1759329810710 | `CreateCategoriesTable.ts` | ตาราง `categories` + nested set metadata |
| 1759331903398 | `CreateProductCategoriesTable.ts` | ตารางเชื่อม product ↔ category |
| 1759334773676 | `CreatePromotionApplicableProductsTable.ts` | ตารางผูก promotion ↔ product |
| 1759335819053 | `CreatePromotionApplicableCategoriesTable.ts` | ตารางผูก promotion ↔ category |
| 1759336265326 | `AddForeignKeysToProductCategoriesTable.ts` | FK constraints สำหรับ product_categories |
| 1759336631142 | `AddForeignKeysToPromotionApplicableProductsTable.ts` | FK constraints สำหรับ promotion_applicable_products |
| 1759336875059 | `AddForeignKeysToPromotionApplicableCategoriesTable.ts` | FK constraints สำหรับ promotion_applicable_categories |
| 1759337162032 | `AddForeignKeyToCategoriesParentId.ts` | FK self reference ตัว parent |
| 1759371525447 | `CategoriesAncestorsArray.ts` | เพิ่ม column `ancestors` (uuid[]) |
| 1759374417899 | `AddTreeIdToCategories_20251002.ts` | เพิ่ม column `tree_id` |

> **Note:** ตรวจสอบชื่อไฟล์/ timestamp ทุกครั้งก่อนสร้าง migration ใหม่เพื่อเลี่ยง conflict

## 📝 Workflow
### Development
1. แก้ entity หรือ domain ที่เกี่ยวข้อง
2. `pnpm run migration:generate src/databases/migrations/<Name>`
3. ตรวจไฟล์ที่ได้ (index, FK, default)
4. `pnpm run migration:run`
5. เพิ่ม unit test/seed หากจำเป็น

### Production
1. ตรวจสอบ migration คงค้างใน repo ก่อน deploy
2. สำรองฐานข้อมูล
3. `pnpm run migration:run`
4. ตรวจ `pnpm run db:status` ให้เห็นว่า success = true ทุกตัว

### Setup ฐานข้อมูลใหม่
```bash
# วิธีปกติ (แนะนำ)
pnpm run migration:run

# ถ้าต้อง reset ทั้งหมด (dev เท่านั้น)
pnpm run db:reset
```

## 🌱 Environment Variables
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=catalog_promotions_dev
```

## ✅ Best Practices
1. ตั้งชื่อ migration ให้สื่อความหมาย (เช่น `AddIndexTo...`) และใช้ timestamp อัตโนมัติจาก CLI
2. อย่าแก้ไข migration ที่ถูก deploy แล้ว ให้สร้าง migration ใหม่เสมอ
3. ใช้ transaction ใน migration ที่แก้ไขข้อมูลหลายตาราง
4. เพิ่ม/ลบ indexes อย่างมีเหตุผล (ดู `docs/ai-summaries/*index*.md`)
5. รัน `pnpm test` หลัง migration เพื่อยืนยัน domain behavior

## ❗ Troubleshooting
- **Migration fail** → ดูข้อความ error, ใช้ `pnpm run migration:revert` เพื่อย้อน, ตรวจสอบไฟล์และรันใหม่
- **Entity mismatch** → `pnpm run migration:generate src/databases/migrations/FixMismatch`
- **ดูประวัติ** → `pnpm run db:status` หรือ `pnpm run db:stats` จะบอกเวลารัน, ข้อผิดพลาด
- **ต้องรีเซ็ตฐานข้อมูล** (dev) → `pnpm run db:reset`

## 🗂️ Custom history table (`migrations_history`)
ฟิลด์หลัก
- `id`, `timestamp`, `name`
- `executed_at`, `execution_time` (ms)
- `success`, `error_message`
- `created_at`, `updated_at`

ช่วยให้
- audit log ว่าใคร/เมื่อไร
- ติดตาม migration ที่ล้มเหลวได้ง่าย
- ดู performance ของการรัน migrations

---
หากปรับ schema ใหม่ อย่าลืมอัปเดต README และทดสอบ workflow ด้วย `catalog.http` + Swagger เพื่อให้ฐานข้อมูลอยู่ในสภาพพร้อมใช้งานกับฟีเจอร์ promotion engine เสมอครับ 🙌
