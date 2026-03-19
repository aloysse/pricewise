# Shopping Tracker — Claude Code 設定說明

## 目錄結構

```
.claude/
├── settings.json              # Hooks 設定（自動 commit + 安全防護）
├── agents/
│   ├── pm-planner.md          # 產品規劃 Agent
│   ├── db-architect.md        # 資料庫架構 Agent
│   ├── frontend-builder.md    # 前端開發 Agent
│   ├── api-integrator.md      # Claude API 整合 Agent
│   ├── code-reviewer.md       # Code Review Agent
│   └── deploy-agent.md        # 部署 Agent
├── skills/
│   ├── coding-standards/      # TypeScript/React 程式碼規範
│   ├── supabase-patterns/     # Supabase 使用模式與 Schema
│   ├── pwa-requirements/      # PWA 技術需求
│   └── claude-api-patterns/   # Claude Vision API 使用模式
└── commands/
    ├── new-feature.md         # /new-feature 指令
    └── deploy.md              # /deploy 指令

CLAUDE.md                      # 專案主要規則（放在專案根目錄）
```

## 安裝步驟

### 1. 安裝 Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

### 2. 複製設定檔到你的專案
```bash
# 假設你的專案在 ~/projects/shopping-tracker
cp -r .claude ~/projects/shopping-tracker/
cp CLAUDE.md ~/projects/shopping-tracker/
```

### 3. 安裝 MCP Plugin（在 Claude Code 內執行）
```bash
claude  # 啟動 Claude Code

# 在 Claude Code 內執行：
/plugin install supabase
/plugin install vercel
/plugin install github
/plugin install commit-commands
```

### 4. 安裝 Context7 MCP（查詢最新文件）
```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

### 5. 驗證設定
```bash
/mcp        # 確認 MCP 連線狀態
/hooks      # 確認 Hooks 設定
/agents     # 確認 Agents 載入
```

## 使用方式

### 開發新功能
```
/new-feature 新增拍照上傳收據功能
```

### 指定 Agent
```
使用 pm-planner agent 規劃價格比較功能
使用 db-architect agent 設計 price_history 資料表
使用 frontend-builder agent 實作購物清單頁面
使用 code-reviewer agent 審查剛才的修改
```

### 部署
```
/deploy
/deploy staging
```

## Hooks 說明

**Stop Hook（自動備份 commit）**
每次 Claude 完成任務後，自動執行：
```bash
git add -A && git commit -m "checkpoint: YYYY-MM-DD HH:MM"
```
這是保底機制，正常情況下 Claude 會在任務中主動 commit。

**PreToolUse Hook（安全防護）**
防止修改以下敏感檔案：
- `.env`、`.env.*`
- `package-lock.json`
- `.git/` 目錄

## 常見問題

**Q：Subagent 沒有被自動呼叫？**
在指令中明確說明「使用 X agent」，或使用 `/new-feature` 指令觸發完整流程。

**Q：MCP 連線失敗？**
輸入 `/mcp` 查看狀態，依照提示重新授權。Supabase MCP 需要瀏覽器 OAuth 授權。

**Q：Hooks 沒有觸發？**
輸入 `/hooks` 確認設定是否正確載入。確認 `jq` 已安裝：`brew install jq`。