---
name: claude-api-patterns
description: Claude Vision API 使用模式、Prompt 設計、回傳解析。實作 AI 照片分析功能時套用。
---

# Claude API 使用模式

## 安全原則（重要）

- Claude API key **只能放在 Supabase Edge Function**
- 環境變數名稱：`ANTHROPIC_API_KEY`
- 前端只呼叫 Supabase Edge Function，不直接呼叫 Claude API
- 永遠不要把 API key commit 到 git

## Edge Function 中的使用

```typescript
import Anthropic from "npm:@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});
```

## 照片分析 Prompt 模板

### 收據/發票分析

```
請分析這張購物收據或發票，以 JSON 格式回傳以下資訊。
若某欄位無法辨識或不存在，填入 null。

回傳格式（只回傳 JSON，不要任何其他文字、說明或 markdown）：
{
  "store_name": "店家名稱",
  "purchase_date": "YYYY-MM-DD",
  "items": [
    {
      "name": "商品名稱",
      "quantity": 1,
      "unit": "個",
      "total_price": 100,
      "unit_price": 100
    }
  ],
  "total_amount": 100,
  "currency": "TWD"
}
```

### 商品標籤/價格牌分析

```
請分析這張商品照片或價格標籤，以 JSON 格式回傳商品資訊。
只回傳 JSON，不要其他文字。

{
  "name": "商品名稱",
  "brand": "品牌",
  "quantity": 數量,
  "unit": "單位",
  "price": 價格,
  "unit_price": 單位價格,
  "currency": "TWD"
}
```

## API 呼叫模式

```typescript
const response = await anthropic.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mimeType, // 'image/jpeg' | 'image/png' | 'image/webp'
            data: base64ImageData,
          },
        },
        {
          type: "text",
          text: PROMPT,
        },
      ],
    },
  ],
});
```

## 回傳結果解析

````typescript
function parseClaudeResponse<T>(response: Anthropic.Message): T {
  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  // 移除可能的 markdown code block 包裝
  const text = content.text
    .replace(/^```json\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Failed to parse Claude response: ${text}`);
  }
}
````

## 錯誤處理

```typescript
try {
  const response = await anthropic.messages.create({ ... })
  return parseClaudeResponse(response)
} catch (error) {
  if (error instanceof Anthropic.APIError) {
    if (error.status === 429) throw new Error('API 使用量已達上限，請稍後再試')
    if (error.status === 400) throw new Error('圖片格式不支援')
  }
  throw error
}
```

## 支援的圖片格式

- `image/jpeg` — 最常用，收據照片
- `image/png` — 截圖
- `image/webp` — 現代格式
- 最大圖片大小：5MB（base64 編碼後約 6.7MB）
- 建議先壓縮至 1920px 以內再送出

## 費用考量

- 圖片分析費用依圖片大小計算
- 壓縮圖片可降低 token 使用量
- 建議快取分析結果，不重複分析同一張圖片
