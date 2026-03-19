---
name: supabase-patterns
description: Supabase 使用模式、RLS 規範、Migration 規則。涉及資料庫操作或 Supabase 設定時套用。
---

# Supabase 使用模式

## Client 初始化

```typescript
// src/lib/supabase.ts — 唯一建立 client 的地方
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

所有其他檔案都從這裡匯入：`import { supabase } from '@/lib/supabase'`

## 資料庫查詢模式

### 基本查詢（搭配 TanStack Query）

```typescript
// src/lib/queries.ts
export async function getPurchases(userId: string) {
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      *,
      items (
        *,
        product:products(*)
      )
    `,
    )
    .order("purchase_date", { ascending: false });

  if (error) throw error;
  return data;
}
```

### 在元件中使用

```typescript
const {
  data: purchases,
  isLoading,
  error,
} = useQuery({
  queryKey: ["purchases"],
  queryFn: getPurchases,
});
```

### 新增資料

```typescript
const { data, error } = await supabase
  .from("purchases")
  .insert({ store_name, purchase_date, total_amount })
  .select()
  .single();

if (error) throw error;
return data;
```

## RLS 政策標準範本

每張用戶資料表必須有以下四個政策：

```sql
-- 查詢：只能看自己的資料
CREATE POLICY "select_own" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- 新增：只能新增自己的資料
CREATE POLICY "insert_own" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 更新：只能更新自己的資料
CREATE POLICY "update_own" ON table_name
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 刪除：只能刪除自己的資料
CREATE POLICY "delete_own" ON table_name
  FOR DELETE USING (auth.uid() = user_id);
```

## 核心資料表 Schema

```sql
-- 購物記錄
CREATE TABLE purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_name TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(12,2),
  photo_url TEXT,           -- Supabase Storage 的檔案路徑
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 商品明細（每筆購物的商品清單）
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  name TEXT NOT NULL,
  quantity NUMERIC(10,3) NOT NULL,
  unit TEXT NOT NULL DEFAULT '個',
  total_price NUMERIC(12,2) NOT NULL,
  unit_price NUMERIC(12,4),    -- total_price / quantity，自動計算
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 商品主檔（用於追蹤跨次購買的同一商品）
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  barcode TEXT,
  default_unit TEXT DEFAULT '個',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 價格歷史（用於性價比分析）
CREATE TABLE price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  store_name TEXT,
  quantity NUMERIC(10,3) NOT NULL,
  unit TEXT NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  unit_price NUMERIC(12,4) NOT NULL,
  purchase_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

## Storage 使用

```typescript
// 上傳收據照片
async function uploadReceiptPhoto(file: File, purchaseId: string) {
  const fileExt = file.name.split(".").pop();
  const filePath = `receipts/${purchaseId}.${fileExt}`;

  const { error } = await supabase.storage
    .from("receipts")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("receipts").getPublicUrl(filePath);

  return publicUrl;
}
```

## Migration 命名規則

```
YYYYMMDDHHMMSS_動詞_描述.sql

範例：
20240101120000_create_purchases_table.sql
20240102090000_add_category_to_products.sql
20240103150000_create_price_history_view.sql
```
