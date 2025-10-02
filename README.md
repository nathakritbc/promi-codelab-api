# Catalog Promotions API

NestJS + TypeScript service for displaying products together with the best promotion/discount that applies at the time of the request. The code follows hexagonal architecture: domains hold the rules, use cases orchestrate repositories, adapters expose HTTP controllers, and infrastructure stays isolated.

## What the system supports

- Products can belong to one or many categories.
- Promotions can discount by fixed amount or by percent (with an optional max cap).
- Promotions can target a specific product or a whole category tree (include children flag).
- Promotion rules (min qty/amount) are evaluated before a discount is applied.
- When several promotions overlap, the engine chooses the option that gives the highest discount, then falls back to promotion priority.

## Tech stack

- NestJS 11, TypeScript, pnpm
- TypeORM + PostgreSQL
- Vitest for unit tests
- JWT authentication (see `catalog.http` for quick login)
- Hexagonal architecture with branded domain types

## Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL 15+

## Getting started

```bash
pnpm install
pnpm run build
```

Create a `.env` (copy `env.example`) and configure database + JWT secret.

```bash
pnpm run migration:run
pnpm run start:dev
```

Swagger is available at `http://localhost:9009/api` once the app is running.

> 💡 **Swagger tip**: เปิดเบราว์เซอร์ไปที่ `http://localhost:9009/api` แล้วลองยิงคำสั่งได้ทันที เช่น 
> - `POST /auth/login` เพื่อรับ token
> - `POST /categories`, `POST /products`, `POST /promotions` สำหรับ seed ข้อมูล
> - `GET /catalog/products` เพื่อดูผลลัพธ์ catalog
>
> Swagger จัดกลุ่ม endpoint ตามโมดูล และแสดงตัวอย่าง schema/response ให้เลือกปรับค่าก่อนส่งได้ ช่วยยืนยันพฤติกรรมของระบบได้รวดเร็วโดยไม่ต้องใช้ REST client ภายนอก

## Sample data & manual test plan

Use the REST client script `src/catalog/adapters/inbounds/catalog.http`. Each block is labelled; run them in order with the VS Code REST Client or IntelliJ HTTP Client.

### Step 1: Login

Sends `POST /auth/login` with the seeded admin user. Stores `@myAccessToken` for later requests.

**Request body**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Sample response**

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": {
    "uuid": "9e5b3b3e-6f2c-4fd8-b3e6-7f9d2ba7f8ea",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### Step 2: Seed scenario data

- Create categories `Monitors` and `Computer Accessories`.
- Create products:
  - `4K Monitor` price 12,000
  - `Mechanical Keyboard` price 2,500
  - `Wireless Mouse` price 900
- Link products to their categories.
- Create promotions:
  - Promotion A: `Monitor Mega Sale` (15% capped 1,500) for monitor category, include children.
  - Promotion B: `Accessory Happy Hour` (fixed 200) for computer accessories category.
  - Promotion C: `Keyboard Flash Deal` (10% priority 7) for the keyboard product only.
- Attach promotions to categories/products via the final three POST requests in the script.

| Step | Endpoint | Request body example |
|------|----------|----------------------|
|Create category|`POST /categories`|
```json
{
  "name": "Monitors",
  "status": "active"
}
```|
|Create product|`POST /products`|
```json
{
  "code": "MON-001",
  "name": "4K Monitor",
  "description": "27-inch UHD monitor",
  "price": 12000,
  "status": "active"
}
```|
|Create promotion|`POST /promotions`|
```json
{
  "name": "Monitor Mega Sale",
  "status": "active",
  "startsAt": "2025-01-01T00:00:00Z",
  "endsAt": "2025-12-31T23:59:59Z",
  "discountType": "Percent",
  "discountValue": 15,
  "maxDiscountAmount": 1500,
  "priority": 5
}
```|
|Attach category|`POST /promotion-applicable-categories`|
```json
{
  "promotionId": "${monitorPromotionId}",
  "categoryId": "${monitorCategoryId}",
  "includeChildren": true,
  "status": "active"
}
```|
|Attach product|`POST /promotion-applicable-products`|
```json
{
  "promotionId": "${keyboardPromotionId}",
  "productId": "${keyboardProductId}",
  "status": "active"
}
```|

> _หมายเหตุ_: ตัวอย่างในตารางเป็นหนึ่งในหลายคำสั่งที่อยู่ใน `catalog.http`; ใช้ UUID จาก response ของขั้นตอนก่อนหน้าแทน placeholder

After these calls you have exactly the scenario from the prompt: monitor product under category promotion, keyboard product receiving both a category fixed discount and a product percent discount, mouse only inheriting the accessory promotion.

### Step 3: Fetch catalog view

`GET /catalog/products` returns every product with:

- `basePrice`: list price from product domain
- `finalPrice`: best price after selected promotion
- `discountAmount`: amount applied
- `appliedPromotion`: metadata about the best promotion
- `promotions`: all promotions evaluated in descending discount order

#### Expected results by case

1. **Monitor (category-only promotion)**
   - Applied promotion should be `Monitor Mega Sale`.
   - Discount amount should be 1,500 (15% of 12,000 is 1,800 but capped at 1,500).
   - Final price should be 10,500.

2. **Keyboard (overlapping product vs category)**
   - Product-specific `Keyboard Flash Deal` yields 250 discount (10% of 2,500).
   - Category promotion gives fixed 200.
   - Engine must select `Keyboard Flash Deal` because 250 > 200.
   - Response should show `source` = `product`, `discountAmount` = 250, `finalPrice` = 2,250, with the accessory promotion still listed in the `promotions` array as the second option.

3. **Mouse (single category promotion)**
   - Only `Accessory Happy Hour` applies.
   - Discount amount 200, final price 700.

4. **Promotion deactivation sanity check**
   - Pause any promotion (e.g., `PUT /promotions/:id` status `paused`).
   - Re-run `GET /catalog/products`; affected products should fall back to the next eligible promotion or full price if none remain.

Document observed values during QA to confirm business rules are respected.

**Sample response payload**

```json
{
  "result": [
    {
      "product": {
        "uuid": "${monitorProductId}",
        "code": "MON-001",
        "name": "4K Monitor",
        "description": "27-inch UHD monitor",
        "price": 12000,
        "status": "active"
      },
      "basePrice": 12000,
      "finalPrice": 10500,
      "discountAmount": 1500,
      "appliedPromotion": {
        "promotionId": "${monitorPromotionId}",
        "name": "Monitor Mega Sale",
        "discountType": "Percent",
        "discountValue": 15,
        "maxDiscountAmount": 1500,
        "priority": 5,
        "discountAmount": 1500,
        "finalPrice": 10500,
        "source": "category",
        "metadata": {
          "associationId": "${monitorAssociationId}",
          "appliedCategoryId": "${monitorCategoryId}",
          "includeChildren": true
        }
      },
      "promotions": [
        {
          "promotionId": "${monitorPromotionId}",
          "name": "Monitor Mega Sale",
          "discountType": "Percent",
          "discountValue": 15,
          "maxDiscountAmount": 1500,
          "priority": 5,
          "discountAmount": 1500,
          "finalPrice": 10500,
          "source": "category",
          "metadata": {
            "associationId": "${monitorAssociationId}",
            "appliedCategoryId": "${monitorCategoryId}",
            "includeChildren": true
          }
        }
      ]
    },
    {
      "product": {
        "uuid": "${keyboardProductId}",
        "code": "KEY-001",
        "name": "Mechanical Keyboard",
        "description": "RGB TKL keyboard",
        "price": 2500,
        "status": "active"
      },
      "basePrice": 2500,
      "finalPrice": 2250,
      "discountAmount": 250,
      "appliedPromotion": {
        "promotionId": "${keyboardPromotionId}",
        "name": "Keyboard Flash Deal",
        "discountType": "Percent",
        "discountValue": 10,
        "priority": 7,
        "discountAmount": 250,
        "finalPrice": 2250,
        "source": "product",
        "metadata": {
          "associationId": "${keyboardAssociationId}"
        }
      },
      "promotions": [
        {
          "promotionId": "${keyboardPromotionId}",
          "name": "Keyboard Flash Deal",
          "discountType": "Percent",
          "discountValue": 10,
          "priority": 7,
          "discountAmount": 250,
          "finalPrice": 2250,
          "source": "product",
          "metadata": {
            "associationId": "${keyboardAssociationId}"
          }
        },
        {
          "promotionId": "${accessoryPromotionId}",
          "name": "Accessory Happy Hour",
          "discountType": "Fixed",
          "discountValue": 200,
          "priority": 3,
          "discountAmount": 200,
          "finalPrice": 2300,
          "source": "category",
          "metadata": {
            "associationId": "${accessoryAssociationId}",
            "appliedCategoryId": "${accessoriesCategoryId}",
            "includeChildren": false
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## Automated tests

Unit tests live alongside the domains and use cases. Run them with:

```bash
pnpm test
```

(If `fnm` symlink permissions block the test command inside containers, set `FNM_MULTISHELL_PATH` to a writable path before re-running.)

Notable suites:

- `src/catalog/applications/domains/catalogProduct.domain.spec.ts` verifies discount selection rules.
- `src/catalog/applications/usecases/getCatalogProducts.usecase.spec.ts` stubs repositories to cover category + product promotion merges.

## Project layout

```
src/
  catalog/
    adapters/inbounds/        # Catalog controller + REST script
    applications/
      domains/                # CatalogProduct domain model
      usecases/               # GetCatalogProducts use case
  products/ ...               # Existing modules reused via ports
  promotions/ ...
```

Every module exports its repository token so `CatalogModule` can compose them without breaking boundaries.

## Common commands

```bash
pnpm run start:dev    # start NestJS with reload
pnpm run lint         # run oxlint
pnpm run migration:run
pnpm run migration:revert
```

## Notes

- Authentication is required for all endpoints; remember the login step in the HTTP script.
- The catalog endpoint is read-only and transactional via `@nestjs-cls/transactional` to reuse the request-scoped TypeORM manager.
- When adding new promotion scenarios, update the sample script and tests to reflect expected catalogue outcomes.