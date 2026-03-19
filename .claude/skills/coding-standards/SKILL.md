---
name: coding-standards
description: 這個專案的程式碼規範與開發標準。所有涉及撰寫程式碼的任務都應套用此規範。
---

# Shopping Tracker — 程式碼規範

## TypeScript 規範

### 禁止事項

```typescript
// ❌ 禁止使用 any
const data: any = response;

// ❌ 禁止非空斷言（除非確定不為 null）
const value = data!.field;

// ❌ 禁止 @ts-ignore（若需要例外，必須留下說明）
// @ts-ignore
```

### 正確做法

```typescript
// ✅ 使用具體型別
const data: PurchaseItem = response;

// ✅ 使用型別縮窄
if (data !== null) {
  const value = data.field;
}

// ✅ 使用可選鏈
const value = data?.field ?? defaultValue;
```

## 命名規範

| 類型         | 規範             | 範例                          |
| ------------ | ---------------- | ----------------------------- |
| 元件         | PascalCase       | `PurchaseCard`, `ItemList`    |
| 函式/變數    | camelCase        | `getPurchases`, `totalAmount` |
| 常數         | UPPER_SNAKE_CASE | `MAX_IMAGE_SIZE`              |
| 型別/介面    | PascalCase       | `PurchaseItem`, `ApiResponse` |
| 檔案（元件） | PascalCase       | `PurchaseCard.tsx`            |
| 檔案（工具） | camelCase        | `formatCurrency.ts`           |

## 錯誤處理

### API 呼叫統一模式

```typescript
// Supabase 查詢
const { data, error } = await supabase.from("purchases").select("*");
if (error) throw new Error(`DB Error: ${error.message}`);

// Edge Function 呼叫
const { data, error } = await supabase.functions.invoke("analyze-receipt", {
  body,
});
if (error) throw error;
```

### 錯誤邊界

所有頁面層元件需要有錯誤處理：

```tsx
if (error) return <ErrorMessage message={error.message} />;
if (isLoading) return <LoadingSpinner />;
if (!data) return <EmptyState />;
```

## 匯入順序

```typescript
// 1. React / 第三方套件
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. 內部模組（絕對路徑）
import { supabase } from "@/lib/supabase";
import type { Purchase } from "@/types/database.types";

// 3. 相對路徑
import { PurchaseCard } from "./PurchaseCard";
```

## 元件大小限制

- 單一元件檔案不超過 **150 行**
- 單一函式不超過 **50 行**
- 超過時應拆分為子元件或自訂 hook

## 貨幣與數字格式

```typescript
// 統一使用工具函式
import { formatCurrency, formatUnitPrice } from "@/utils/format";

formatCurrency(1250); // "NT$1,250"
formatUnitPrice(25.5, "kg"); // "NT$25.5/kg"
```
