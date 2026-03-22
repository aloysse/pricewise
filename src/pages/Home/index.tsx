import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { usePurchases, type PurchaseWithItems } from '@/hooks/usePurchases'

// ── Colour palette for item avatars ──────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-orange-100 text-orange-600',
  'bg-purple-100 text-purple-600',
  'bg-rose-100 text-rose-600',
]

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
  })
}

function formatUnitPrice(unitPrice: number, unit: string) {
  const price = unitPrice < 1 ? unitPrice.toFixed(4) : unitPrice.toFixed(2)
  return `NT$${price}/${unit}`
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
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

// ── Purchase card ─────────────────────────────────────────────────────────────
function PurchaseCard({ purchase }: { purchase: PurchaseWithItems }) {
  const item = purchase.items[0]
  if (!item) return null

  const color = avatarColor(item.name)

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-bold text-base ${color}`}>
          {item.name.slice(0, 1)}
        </div>

        {/* Name + store */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--color-text)] truncate">{item.name}</p>
          {purchase.store_name && (
            <p className="text-xs text-[var(--color-text-muted)] truncate">{purchase.store_name}</p>
          )}
        </div>

        {/* Amount + date */}
        <div className="text-right shrink-0">
          <p className="font-semibold text-[var(--color-text)]">NT${purchase.total_amount?.toFixed(0) ?? '—'}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{formatDate(purchase.purchase_date)}</p>
        </div>
      </div>

      {/* Unit price badge */}
      <div className="self-start">
        <span className="text-xs bg-gray-50 border border-[var(--color-border)] rounded-full px-2.5 py-0.5 text-[var(--color-text-muted)]">
          {formatUnitPrice(item.unit_price, item.unit)}
        </span>
      </div>
    </div>
  )
}

// ── Date filter helpers ───────────────────────────────────────────────────────
type DateFilter = 'all' | 'month' | '30days'

function getDateThreshold(filter: DateFilter): Date | null {
  if (filter === 'all') return null
  const d = new Date()
  if (filter === 'month') {
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
  } else {
    d.setDate(d.getDate() - 30)
    d.setHours(0, 0, 0, 0)
  }
  return d
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const greeting = user?.email ? user.email.split('@')[0] : '朋友'

  const { data: purchases, isLoading } = usePurchases()

  const [filterOpen, setFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  const uniqueStores = useMemo(() => {
    if (!purchases) return []
    const seen = new Set<string>()
    purchases.forEach((p) => {
      if (p.store_name) seen.add(p.store_name)
    })
    return Array.from(seen)
  }, [purchases])

  const filteredPurchases = useMemo(() => {
    if (!purchases) return []
    const threshold = getDateThreshold(dateFilter)
    const q = searchQuery.trim().toLowerCase()

    return purchases.filter((p) => {
      if (threshold && new Date(p.purchase_date + 'T00:00:00') < threshold) return false
      if (selectedStore && p.store_name !== selectedStore) return false
      if (q && !p.items.some((item) => item.name.toLowerCase().includes(q))) return false
      return true
    })
  }, [purchases, dateFilter, selectedStore, searchQuery])

  const hasFilter = searchQuery.trim() !== '' || dateFilter !== 'all' || selectedStore !== null
  const isEmpty = !isLoading && filteredPurchases.length === 0

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <header className="bg-white px-4 pt-5 pb-4 flex items-center justify-between border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-primary)]">PriceWise</h1>
        <span className="text-sm text-[var(--color-text-muted)]">你好，{greeting}</span>
      </header>

      <div className="flex-1 px-4 py-5 flex flex-col gap-4">
        {/* Section heading + filter toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text)]">最近購物記錄</h2>
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              hasFilter
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-blue-50'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            篩選 {filterOpen ? '▲' : '▼'}
          </button>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 flex flex-col gap-3">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 搜尋品項名稱"
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />

            {/* Date chips */}
            <div className="flex gap-2">
              {(['all', 'month', '30days'] as DateFilter[]).map((f) => {
                const label = f === 'all' ? '全部' : f === 'month' ? '本月' : '近30天'
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setDateFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      dateFilter === f
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Store chips */}
            {uniqueStores.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uniqueStores.map((store) => (
                  <button
                    key={store}
                    type="button"
                    onClick={() => setSelectedStore(selectedStore === store ? null : store)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedStore === store
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {store}
                  </button>
                ))}
              </div>
            )}

            {/* Clear filters */}
            {hasFilter && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setDateFilter('all'); setSelectedStore(null) }}
                className="text-xs text-[var(--color-text-muted)] underline self-start"
              >
                清除篩選
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-20 h-20 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
              <svg width="40" height="40" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <div className="text-center">
              {hasFilter ? (
                <>
                  <p className="text-[var(--color-text)] font-medium">找不到符合記錄</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">試著調整篩選條件</p>
                </>
              ) : (
                <>
                  <p className="text-[var(--color-text)] font-medium">尚無購物記錄</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">拍張照片開始記錄第一筆</p>
                </>
              )}
            </div>
            {!hasFilter && (
              <Link
                to="/new"
                className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium"
              >
                立即新增
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredPurchases.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
