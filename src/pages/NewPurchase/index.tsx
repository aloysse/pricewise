import { useState } from 'react'

function IconCamera() {
  return (
    <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

export default function NewPurchasePage() {
  const today = new Date().toISOString().split('T')[0]
  const [storeName, setStoreName] = useState('')
  const [date, setDate] = useState(today)

  const canSubmit = storeName.trim().length > 0

  function handleCamera() {
    // TODO: implement camera capture
    console.log('camera')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: implement save
    console.log('submit', { storeName, date })
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="bg-white px-4 pt-5 pb-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)]">新增購物</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">拍照或手動輸入購物資訊</p>
      </header>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5">
        {/* Camera button */}
        <button
          type="button"
          onClick={handleCamera}
          className="w-full bg-white rounded-2xl shadow-sm border border-[var(--color-border)] py-10 flex flex-col items-center gap-3 active:bg-gray-50 transition-colors"
        >
          <span className="text-[var(--color-primary)]">
            <IconCamera />
          </span>
          <div className="text-center">
            <p className="font-semibold text-[var(--color-text)]">拍照辨識</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">自動辨識商品與金額</p>
          </div>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-sm text-[var(--color-text-muted)]">或</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        {/* Manual input form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-[var(--color-text)]">手動輸入</h2>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="store" className="text-sm font-medium text-[var(--color-text)]">
              店家名稱
            </label>
            <input
              id="store"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="例：全聯、家樂福"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className="text-sm font-medium text-[var(--color-text)]">
              購物日期
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium text-base disabled:opacity-40 transition-opacity mt-2"
          >
            儲存記錄
          </button>
        </form>
      </div>
    </div>
  )
}
