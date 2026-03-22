import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/error'

const UNIT_OPTIONS = ['個', '瓶', '罐', '包', '袋', '克', '公斤', '毫升', '公升', '份', '自訂']

function IconCamera() {
  return (
    <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

export default function NewPurchasePage() {
  const user = useAuthStore((s) => s.user)
  const today = new Date().toISOString().split('T')[0]

  const [storeName, setStoreName] = useState('')
  const [date, setDate] = useState(today)
  const [itemName, setItemName] = useState('')
  const [totalPaid, setTotalPaid] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [customUnit, setCustomUnit] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const totalPaidNum = parseFloat(totalPaid)
  const quantityNum = parseFloat(quantity)
  const effectiveUnit = unit === '自訂' ? customUnit.trim() : unit
  const unitPrice = totalPaidNum > 0 && quantityNum > 0 ? totalPaidNum / quantityNum : null

  const canSubmit =
    itemName.trim().length > 0 &&
    totalPaidNum > 0 &&
    quantityNum > 0 &&
    effectiveUnit.length > 0

  function handleCamera() {
    // TODO: implement camera capture
    console.log('camera')
  }

  function resetForm() {
    setItemName('')
    setTotalPaid('')
    setQuantity('')
    setUnit('')
    setCustomUnit('')
    setStoreName('')
    setDate(today)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !canSubmit || !unitPrice) return

    setError('')
    setIsLoading(true)

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        store_name: storeName.trim() || null,
        purchase_date: date,
        total_amount: totalPaidNum,
      })
      .select()
      .single()

    if (purchaseError || !purchase) {
      setError(getErrorMessage(purchaseError))
      setIsLoading(false)
      return
    }

    const { error: itemError } = await supabase.from('items').insert({
      purchase_id: purchase.id,
      name: itemName.trim(),
      quantity: quantityNum,
      unit: effectiveUnit,
      unit_price: Math.round(unitPrice * 10000) / 10000,
    })

    setIsLoading(false)

    if (itemError) {
      setError(getErrorMessage(itemError))
      return
    }

    setSuccess(true)
    resetForm()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="bg-white px-4 pt-5 pb-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)]">新增購物</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">拍照或手動輸入購物資訊</p>
      </header>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5">
        {/* Success banner */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
            記錄已儲存成功！
          </div>
        )}

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

          {/* Store & date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="store" className="text-sm font-medium text-[var(--color-text)]">
              店家名稱 <span className="text-[var(--color-text-muted)] font-normal">（選填）</span>
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

          {/* Divider */}
          <div className="h-px bg-[var(--color-border)]" />

          {/* Item fields */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="itemName" className="text-sm font-medium text-[var(--color-text)]">
              品項名稱
            </label>
            <input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="例：燕麥奶、雞胸肉、洗碗精"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="totalPaid" className="text-sm font-medium text-[var(--color-text)]">
              購買金額 <span className="text-[var(--color-text-muted)] font-normal">（NTD）</span>
            </label>
            <input
              id="totalPaid"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={totalPaid}
              onChange={(e) => setTotalPaid(e.target.value)}
              placeholder="例：65"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="quantity" className="text-sm font-medium text-[var(--color-text)]">
                數量
              </label>
              <input
                id="quantity"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="例：120"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="unit" className="text-sm font-medium text-[var(--color-text)]">
                單位
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base bg-white"
              >
                <option value="" disabled>選擇</option>
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {unit === '自訂' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="customUnit" className="text-sm font-medium text-[var(--color-text)]">
                自訂單位
              </label>
              <input
                id="customUnit"
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="例：片、顆、條"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
              />
            </div>
          )}

          {/* Unit price preview */}
          {unitPrice !== null && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">每{effectiveUnit || '單位'}單價</span>
              <span className="text-base font-semibold text-[var(--color-primary)]">
                ${unitPrice < 1
                  ? unitPrice.toFixed(4)
                  : unitPrice.toFixed(2)} / {effectiveUnit || '單位'}
              </span>
            </div>
          )}

          {error && (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium text-base disabled:opacity-40 transition-opacity mt-2"
          >
            {isLoading ? '儲存中...' : '儲存記錄'}
          </button>
        </form>
      </div>
    </div>
  )
}
