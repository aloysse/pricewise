---
description: 開始開發新功能。依序執行：規劃 → 資料庫 → 後端 → 前端 → Review
allowed-tools: Read, Write, Edit, Bash, mcp__supabase
---

# 新功能開發流程

功能描述：$ARGUMENTS

## 執行步驟

### Step 1：需求規劃
使用 `pm-planner` subagent 分析需求並產出 spec 文件。

### Step 2：資料庫設計
如果需要資料庫變更，使用 `db-architect` subagent：
- 設計 schema
- 建立 migration 檔案
- 產生 TypeScript 型別

### Step 3：後端 / API 整合
如果需要 Claude Vision API 或 Edge Function，使用 `api-integrator` subagent。

### Step 4：前端實作
使用 `frontend-builder` subagent 實作 UI 元件和頁面。

### Step 5：Code Review
使用 `code-reviewer` subagent 審查所有新增的程式碼。

### Step 6：完成
確認所有變更已 commit，回報完成狀態。