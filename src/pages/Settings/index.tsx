import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { getErrorMessage } from '@/utils/error'
import { useState } from 'react'

function IconChevronRight() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

const settingsItems = [
  { label: '通知設定' },
  { label: '資料匯出' },
  { label: '關於 PriceWise' },
] as const

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const setSession = useAuthStore((s) => s.setSession)
  const [logoutError, setLogoutError] = useState('')

  const initial = user?.email ? user.email[0].toUpperCase() : '?'

  async function handleLogout() {
    setLogoutError('')
    const { error } = await supabase.auth.signOut()
    if (error) {
      setLogoutError(getErrorMessage(error))
    } else {
      setUser(null)
      setSession(null)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="bg-white px-4 pt-5 pb-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)]">設定</h1>
      </header>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-white">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--color-text)] truncate">{user?.email ?? '—'}</p>
            <button type="button" className="text-sm text-[var(--color-primary)] mt-0.5">
              編輯個人資料
            </button>
          </div>
        </div>

        {/* Settings list */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-[var(--color-border)]">
          {settingsItems.map(({ label }) => (
            <button
              key={label}
              type="button"
              className="w-full flex items-center justify-between px-4 py-4 text-[var(--color-text)] active:bg-gray-50 transition-colors"
            >
              <span className="text-base">{label}</span>
              <span className="text-[var(--color-text-muted)]">
                <IconChevronRight />
              </span>
            </button>
          ))}
        </div>

        {/* Logout */}
        {logoutError && (
          <p className="text-sm text-[var(--color-error)] text-center">{logoutError}</p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-red-200 text-red-500 font-medium text-base active:bg-red-50 transition-colors"
        >
          登出
        </button>
      </div>
    </div>
  )
}
