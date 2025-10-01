# Promotions Table - Index Optimization

## 🎯 สรุป: Indexes เหมาะสมแล้ว แต่มี 1 index ซ้ำซ้อน

### ✅ Indexes ที่ควรมี (5-6 indexes เพียงพอ):

1. **`IDX_PROMOTIONS_STATUS`** ✅ จำเป็น
   - Filter by status (active, draft, paused, ended)
   - ใช้บ่อยมาก

2. **`IDX_PROMOTIONS_DISCOUNT_TYPE`** ✅ จำเป็น
   - Filter by discount type (Percent, Fixed)
   - ใช้บ่อย

3. **`IDX_PROMOTIONS_STATUS_PRIORITY`** ✅ จำเป็นมาก (Composite)
   - Default query: `WHERE status = 'active' ORDER BY priority DESC`
   - ใช้บ่อยที่สุด

4. **`IDX_PROMOTIONS_CREATED_AT`** ✅ จำเป็น
   - Default secondary sorting
   - Reporting queries

5. **`IDX_PROMOTIONS_STARTS_AT`** ⚠️ Optional
   - ใช้เมื่อ: หา promotions ที่เริ่มในช่วงเวลา
   - ถ้าไม่ค่อยใช้ → อาจลบได้

6. **`IDX_PROMOTIONS_ENDS_AT`** ⚠️ Optional
   - ใช้เมื่อ: หา promotions ที่หมดอายุ
   - ถ้าไม่ค่อยใช้ → อาจลบได้

### ❌ Indexes ที่ควรลบ:

7. **`IDX_PROMOTIONS_PRIORITY`** ❌ ซ้ำซ้อน!
   - เหตุผล: มี composite index `(status, priority)` แล้ว
   - Composite index สามารถใช้แทนได้เมื่อ query เฉพาะ priority
   - **ควรลบเพื่อประหยัด disk space และ write performance**

---

## 📊 Index Coverage Analysis

### Query Pattern 1: Get Active Promotions (ใช้บ่อยที่สุด)
```sql
SELECT * FROM promotions 
WHERE status = 'active' 
ORDER BY priority DESC, created_at DESC
```
✅ **Used Index:** `IDX_PROMOTIONS_STATUS_PRIORITY` (perfect!)

### Query Pattern 2: Filter by Discount Type
```sql
SELECT * FROM promotions 
WHERE discount_type = 'Percent'
ORDER BY priority DESC
```
✅ **Used Index:** `IDX_PROMOTIONS_DISCOUNT_TYPE`

### Query Pattern 3: Check Active Promotions by Date
```sql
SELECT * FROM promotions 
WHERE status = 'active' 
  AND starts_at <= NOW() 
  AND ends_at >= NOW()
```
✅ **Used Index:** `IDX_PROMOTIONS_STATUS_PRIORITY` (status)
⚠️ **Then:** Sequential scan on starts_at, ends_at
💡 **Consideration:** อาจต้อง composite index `(status, starts_at, ends_at)` ถ้าใช้บ่อย

### Query Pattern 4: Sort by Priority Only
```sql
SELECT * FROM promotions 
ORDER BY priority DESC
```
✅ **Can use:** `IDX_PROMOTIONS_STATUS_PRIORITY` (ตัวหลัง)
❌ **Not needed:** `IDX_PROMOTIONS_PRIORITY` (ซ้ำซ้อน!)

---

## 🔧 แนวทางปรับปรุง

### Option 1: ลด Indexes (แนะนำ)
```sql
-- ลบ index ที่ซ้ำซ้อน
DROP INDEX IF EXISTS IDX_PROMOTIONS_PRIORITY;

-- เก็บไว้แค่ 6 indexes หลัก:
-- 1. IDX_PROMOTIONS_STATUS
-- 2. IDX_PROMOTIONS_DISCOUNT_TYPE
-- 3. IDX_PROMOTIONS_STATUS_PRIORITY (composite)
-- 4. IDX_PROMOTIONS_CREATED_AT
-- 5. IDX_PROMOTIONS_STARTS_AT (optional)
-- 6. IDX_PROMOTIONS_ENDS_AT (optional)
```

### Option 2: เพิ่ม Composite Index สำหรับ Active Promotions Check
ถ้าใช้ query นี้บ่อย:
```sql
CREATE INDEX IDX_PROMOTIONS_ACTIVE_DATE_RANGE 
ON promotions (status, starts_at, ends_at) 
WHERE status = 'active';
```
**ข้อดี:** Partial index, เก็บเฉพาะ active promotions
**ข้อเสีย:** เพิ่ม index อีก 1 ตัว

---

## 💰 Trade-offs

### ข้อดีของ Indexes:
- ✅ Query เร็วขึ้นมาก (SELECT, WHERE, ORDER BY)
- ✅ รองรับ concurrent users ได้ดีขึ้น

### ข้อเสียของ Indexes มากเกินไป:
- ❌ **Write Performance**: INSERT/UPDATE/DELETE ช้าลง
- ❌ **Disk Space**: ใช้พื้นที่มากขึ้น
- ❌ **Maintenance**: Rebuild, vacuum ใช้เวลานานขึ้น

### สำหรับ Promotions Table:
- **Read:Write Ratio** ประมาณ **80:20** (อ่านมากกว่าเขียน)
- **Data Volume**: น้อย-ปานกลาง (ประมาณ 100-1000 promotions)
- **Conclusion**: 5-6 indexes **เหมาะสม**, 7 indexes **ใช้ได้แต่มี 1 ตัวซ้ำซ้อน**

---

## ✅ สรุปคำแนะนำ

### สำหรับ Production:
1. **ลบ** `IDX_PROMOTIONS_PRIORITY` (ซ้ำซ้อน)
2. **เก็บ** indexes อื่นๆ ไว้ทั้งหมด (5-6 indexes)
3. **Monitor** query performance ในช่วงแรก
4. **ลบ** `starts_at`, `ends_at` indexes ถ้าไม่ค่อยใช้

### ปัจจุบัน (Development):
- ✅ **ใช้ได้เลย** ทุก indexes ที่มี
- ⚠️ แต่ควรจะลบ `priority` index เพื่อความเหมาะสม

---

## 📈 Benchmarks (ประมาณการ)

| Scenario | With Current Indexes | Without priority Index |
|----------|---------------------|----------------------|
| Query Speed | ⚡⚡⚡ Fast | ⚡⚡⚡ Fast (ไม่ต่าง) |
| Insert Speed | 🐢 Slower | 🐢 Slower (ดีขึ้นนิดหน่อย) |
| Disk Space | 📦📦📦 ~15-20MB | 📦📦 ~13-17MB |

**สรุป:** ลด index ที่ซ้ำซ้อนได้ประมาณ **10-15% disk space** และ **5-10% write performance**

