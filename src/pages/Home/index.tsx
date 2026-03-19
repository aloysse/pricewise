import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-14" />
    </div>
  )
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const greeting = user?.email ? user.email.split('@')[0] : '朋友'

  // Placeholder: no data yet
  const hasRecords = false

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <header className="bg-white px-4 pt-5 pb-4 flex items-center justify-between border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-primary)]">PriceWise</h1>
        <span className="text-sm text-[var(--color-text-muted)]">你好，{greeting}</span>
      </header>

      <div className="flex-1 px-4 py-5 flex flex-col gap-4">
        {/* Section heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text)]">最近購物記錄</h2>
        </div>

        {hasRecords ? (
          /* Skeleton preview while loading */
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-20 h-20 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
              <svg width="40" height="40" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[var(--color-text)] font-medium">尚無購物記錄</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">拍張照片開始記錄第一筆</p>
            </div>
            <Link
              to="/new"
              className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium"
            >
              立即新增
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
