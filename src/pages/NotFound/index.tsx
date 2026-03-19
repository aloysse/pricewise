import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-4">
      <p className="text-7xl font-bold text-[var(--color-primary)]">404</p>
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">找不到此頁面</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">你要找的頁面不存在或已被移除</p>
      </div>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium"
      >
        返回首頁
      </Link>
    </div>
  )
}
