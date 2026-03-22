import { useState, useMemo } from 'react'
import { useAnalyticsData, type AnalyticsRawItem } from '@/hooks/useAnalyticsData'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtUnitPrice(price: number, unit: string) {
  return `NT$${price < 1 ? price.toFixed(4) : price.toFixed(2)}/${unit}`
}

function fmtAmount(amount: number) {
  return `NT$${amount.toFixed(0)}`
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
  })
}

function getMonthKeys(count: number): { key: string; label: string }[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (count - 1 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${d.getMonth() + 1}月`
    return { key, label }
  })
}

// ── Derived types ─────────────────────────────────────────────────────────────

type PurchaseSummary = {
  id: string
  purchase_date: string
  store_name: string | null
  total_amount: number | null
}

type ItemGroup = {
  key: string        // `${name}__${unit}`
  name: string
  unit: string
  minPrice: number
  maxPrice: number
  count: number
  latestDate: string
}

type DetailRecord = {
  date: string
  store: string | null
  unitPrice: number
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className="text-xl font-bold text-[var(--color-text)]">{value}</span>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">{title}</h2>
      {children}
    </div>
  )
}

function EmptyHint() {
  return (
    <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
      記錄第一筆後就能看到分析
    </p>
  )
}

// ── Item price group row ──────────────────────────────────────────────────────

function ItemGroupRow({
  group,
  records,
  isExpanded,
  onToggle,
}: {
  group: ItemGroup
  records: DetailRecord[]
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasMultiple = group.count > 1

  return (
    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
      {/* Summary row */}
      <button
        type="button"
        className="w-full p-3 flex items-center justify-between gap-2 text-left active:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--color-text)] truncate">{group.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-[var(--color-primary)] font-medium">
              最低 {fmtUnitPrice(group.minPrice, group.unit)}
            </span>
            {hasMultiple && group.maxPrice !== group.minPrice && (
              <span className="text-xs text-[var(--color-text-muted)]">
                最高 {fmtUnitPrice(group.maxPrice, group.unit)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[var(--color-text-muted)]">{group.count} 筆</span>
          <span className="text-xs text-[var(--color-text-muted)]">{isExpanded ? '▲' : '▶'}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {records.map((r, idx) => {
            const isLowest = r.unitPrice === group.minPrice && hasMultiple
            return (
              <div key={idx} className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-[var(--color-text-muted)]">{fmtDate(r.date)}</span>
                  {r.store && (
                    <span className="text-xs text-[var(--color-text-muted)] ml-2">{r.store}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {fmtUnitPrice(r.unitPrice, records[0] ? group.unit : '')}
                </span>
                {isLowest && (
                  <span className="text-xs bg-[var(--color-primary)] text-white rounded-full px-2 py-0.5 shrink-0">
                    ✓ 最低
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data: rawItems = [], isLoading } = useAnalyticsData()
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  // 1. Unique purchases (dedup by purchase_id)
  const uniquePurchases = useMemo<PurchaseSummary[]>(() => {
    const seen = new Set<string>()
    const result: PurchaseSummary[] = []
    rawItems.forEach((item) => {
      if (item.purchases && !seen.has(item.purchase_id)) {
        seen.add(item.purchase_id)
        result.push({
          id: item.purchase_id,
          purchase_date: item.purchases.purchase_date,
          store_name: item.purchases.store_name,
          total_amount: item.purchases.total_amount,
        })
      }
    })
    return result
  }, [rawItems])

  // 2. This month stats
  const thisMonth = new Date().toISOString().slice(0, 7)
  const thisMonthPurchases = useMemo(
    () => uniquePurchases.filter((p) => p.purchase_date.startsWith(thisMonth)),
    [uniquePurchases, thisMonth]
  )
  const monthlySpend = useMemo(
    () => thisMonthPurchases.reduce((sum, p) => sum + (p.total_amount ?? 0), 0),
    [thisMonthPurchases]
  )

  // 3. Item groups by (name, unit)
  const itemGroups = useMemo<ItemGroup[]>(() => {
    const map = new Map<string, { name: string; unit: string; prices: number[]; dates: string[] }>()
    rawItems.forEach((item) => {
      const key = `${item.name}__${item.unit}`
      const date = item.purchases?.purchase_date ?? ''
      const existing = map.get(key)
      if (existing) {
        existing.prices.push(item.unit_price)
        existing.dates.push(date)
      } else {
        map.set(key, { name: item.name, unit: item.unit, prices: [item.unit_price], dates: [date] })
      }
    })
    return Array.from(map.entries())
      .map(([key, { name, unit, prices, dates }]) => ({
        key,
        name,
        unit,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        count: prices.length,
        latestDate: [...dates].sort().reverse()[0] ?? '',
      }))
      .sort((a, b) => b.latestDate.localeCompare(a.latestDate))
  }, [rawItems])

  // 4. Detail records for expanded item (derived from rawItems)
  const expandedRecords = useMemo<DetailRecord[]>(() => {
    if (!expandedKey) return []
    const [name, unit] = expandedKey.split('__')
    return rawItems
      .filter((i) => i.name === name && i.unit === unit)
      .map((i) => ({
        date: i.purchases?.purchase_date ?? '',
        store: i.purchases?.store_name ?? null,
        unitPrice: i.unit_price,
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [expandedKey, rawItems])

  // 5. Store spending
  const storeSpending = useMemo(() => {
    const map = new Map<string, number>()
    uniquePurchases.forEach((p) => {
      const key = p.store_name ?? '未指定'
      map.set(key, (map.get(key) ?? 0) + (p.total_amount ?? 0))
    })
    return Array.from(map.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [uniquePurchases])

  const maxStoreAmount = Math.max(...storeSpending.map((s) => s.amount), 1)

  // 6. Monthly trend (last 6 months)
  const months = useMemo(() => getMonthKeys(6), [])
  const monthTrend = useMemo(
    () =>
      months.map(({ key, label }) => ({
        key,
        label,
        amount: uniquePurchases
          .filter((p) => p.purchase_date.startsWith(key))
          .reduce((sum, p) => sum + (p.total_amount ?? 0), 0),
      })),
    [months, uniquePurchases]
  )
  const maxMonthAmount = Math.max(...monthTrend.map((m) => m.amount), 1)

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <header className="bg-white px-4 pt-5 pb-4 border-b border-[var(--color-border)]">
          <h1 className="text-xl font-bold text-[var(--color-text)]">消費分析</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">瞭解你的購物習慣</p>
        </header>
        <div className="flex-1 px-4 py-5 flex flex-col gap-5">
          <div className="flex gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex-1 bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const hasData = rawItems.length > 0

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
          <StatCard
            label="本月支出"
            value={monthlySpend > 0 ? fmtAmount(monthlySpend) : 'NT$0'}
          />
          <StatCard
            label="本月購物次數"
            value={`${thisMonthPurchases.length} 次`}
          />
        </div>

        {/* Item price groups */}
        <SectionCard title="品項單價比較">
          {!hasData ? (
            <EmptyHint />
          ) : (
            <div className="flex flex-col gap-2">
              {itemGroups.map((group) => (
                <ItemGroupRow
                  key={group.key}
                  group={group}
                  records={expandedKey === group.key ? expandedRecords : []}
                  isExpanded={expandedKey === group.key}
                  onToggle={() =>
                    setExpandedKey(expandedKey === group.key ? null : group.key)
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Store spending */}
        <SectionCard title="各店家花費分佈">
          {storeSpending.length === 0 ? (
            <EmptyHint />
          ) : (
            <div className="flex flex-col gap-3">
              {storeSpending.map(({ name, amount }) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text)]">{name}</span>
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {fmtAmount(amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                      style={{ width: `${(amount / maxStoreAmount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Monthly trend */}
        <SectionCard title="月支出趨勢">
          {!hasData ? (
            <EmptyHint />
          ) : (
            <div className="flex items-end justify-around gap-1" style={{ height: 140 }}>
              {monthTrend.map(({ key, label, amount }) => {
                const barH = Math.max(amount > 0 ? (amount / maxMonthAmount) * 100 : 0, 0)
                return (
                  <div key={key} className="flex flex-col items-center gap-1 flex-1">
                    {amount > 0 && (
                      <span className="text-[10px] text-[var(--color-text-muted)] leading-none">
                        {amount >= 100 ? `$${Math.round(amount)}` : ''}
                      </span>
                    )}
                    <div className="flex-1 flex items-end w-full px-1">
                      <div
                        className="w-full rounded-t bg-[var(--color-primary)] opacity-80 transition-all min-h-0"
                        style={{ height: amount > 0 ? `${barH}%` : '2px', opacity: amount > 0 ? 0.8 : 0.2 }}
                      />
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
