function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className="text-xl font-bold text-[var(--color-text)]">{value}</span>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0" />
      <div className="flex-1 h-3.5 bg-gray-200 rounded" />
      <div className="w-16 h-3.5 bg-gray-100 rounded" />
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="bg-white px-4 pt-5 pb-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)]">消費分析</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">瞭解你的購物習慣</p>
      </header>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5">
        {/* Stat cards */}
        <div className="flex gap-3">
          <StatCard label="本月支出" value="$—" />
          <StatCard label="購物次數" value="— 次" />
        </div>

        {/* Chart placeholder */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">支出趨勢</h2>
          <div
            className="rounded-xl bg-[var(--color-bg)] flex items-center justify-center"
            style={{ height: 200 }}
          >
            <div className="text-center">
              <svg width="40" height="40" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto mb-2">
                <path d="M3 12h4v8H3zM10 8h4v12h-4zM17 4h4v16h-4z" />
              </svg>
              <p className="text-sm text-[var(--color-text-muted)]">尚無資料</p>
            </div>
          </div>
        </div>

        {/* Top categories */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">最高支出品類</h2>
          <div className="flex flex-col gap-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </div>
      </div>
    </div>
  )
}
