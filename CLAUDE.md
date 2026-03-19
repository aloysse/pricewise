# Shopping Tracker PWA — Project Rules

## 專案概述
個人購物記錄 PWA，透過照片分析自動辨識商品資訊，記錄單位價格與消費行為，提供性價比分析。
個人使用為主，未來擴展為公開 App（Flutter）。

## 技術棧
- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4
- **State**: Zustand
- **Data fetching**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **AI 分析**: Anthropic Claude Vision API
- **Deploy**: Vercel

## 目錄結構
```
src/
├── components/        # 可重用 UI 元件
├── pages/             # 頁面元件（對應路由）
├── hooks/             # 自訂 React hooks
├── stores/            # Zustand 狀態
├── lib/
│   ├── supabase.ts    # Supabase client（唯一入口）
│   └── claude.ts      # Claude API 工具函式
├── types/             # TypeScript 型別定義
│   └── database.types.ts  # 從 Supabase 產生
└── utils/             # 純函式工具

supabase/
├── migrations/        # 所有 DB 變更必須透過 migration
└── functions/         # Edge Functions（如需要）

.claude/
├── agents/            # Subagent 定義
├── skills/            # 共用知識庫
└── commands/          # Slash commands
```

## 開發規範

### 通用
- 所有程式碼使用 TypeScript，禁止使用 `any`
- 元件檔案使用 PascalCase，工具函式使用 camelCase
- 新功能開發流程：需求 → spec 文件 → DB schema → 後端邏輯 → 前端 UI
- 每個功能完成後主動執行 git commit

### Git Workflow
- 完成每個邏輯單元後立即執行 git commit
- 使用 Conventional Commits 格式：
  - `feat:` 新功能
  - `fix:` 修正 bug
  - `refactor:` 重構
  - `docs:` 文件
  - `chore:` 設定、依賴更新
  - `db:` 資料庫 schema 變更
- commit message 用英文，可附繁中說明
- **不要主動執行 git push**，除非被明確要求
- 不要修改 `.env`、`.env.*`、`package-lock.json`

### 前端
- 所有 UI 以 mobile-first 設計，最小寬度 375px
- Supabase client 統一從 `src/lib/supabase.ts` 匯入，不得在元件直接建立
- 非同步資料一律使用 TanStack Query 管理
- 錯誤處理統一使用 `src/utils/error.ts` 的工具函式

### 資料庫
- 所有 DB 變更必須建立 migration 檔案，不直接在 dashboard 操作
- Migration 命名：`YYYYMMDDHHMMSS_描述.sql`
- 每張新資料表都必須啟用 RLS
- TypeScript 型別從 Supabase CLI 產生：`supabase gen types typescript`

### 安全
- API key 只能放在環境變數，禁止 hardcode
- Claude API 呼叫只能在後端（Edge Function）或透過 proxy，不可直接從前端暴露 API key
- 使用者資料查詢必須透過 RLS 確保隔離

## Subagent 使用指引
- `pm-planner`：規劃新功能時使用
- `db-architect`：設計或修改資料庫 schema 時使用
- `frontend-builder`：實作 UI 元件和頁面時使用
- `api-integrator`：串接 Claude Vision API 相關功能時使用
- `code-reviewer`：完成實作後進行 code review
- `deploy-agent`：部署到 Vercel 時使用