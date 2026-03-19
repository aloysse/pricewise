---
description: 部署到 Vercel。執行前檢查、套用 DB migration、觸發部署、確認結果。
allowed-tools: Bash, mcp__vercel, mcp__supabase
---

# 部署流程

目標環境：$ARGUMENTS（預設為 production）

## 執行步驟

### Step 1：Pre-deploy 檢查
```bash
npx tsc --noEmit && npm run build
```
若有錯誤，停止並回報，不繼續部署。

### Step 2：資料庫 Migration
確認所有 migration 已套用：
```bash
supabase db push
```

### Step 3：部署
使用 `deploy-agent` subagent 執行部署流程：
- 確認環境變數設定
- 觸發 Vercel 部署
- 監控部署狀態

### Step 4：驗證
部署完成後確認：
- 網站可正常存取
- 基本功能正常

### Step 5：回報
回報部署 URL 和結果。