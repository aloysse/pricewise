import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getErrorMessage } from '@/utils/error'

type Phase = 'email' | 'otp'

export default function LoginPage() {
  const [phase, setPhase] = useState<Phase>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setIsLoading(false)
    if (authError) {
      setError(getErrorMessage(authError))
    } else {
      setPhase('otp')
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })
    setIsLoading(false)
    if (authError) {
      setError(getErrorMessage(authError))
    }
    // Redirect handled by App.tsx via onAuthStateChange
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)] mb-4">
            <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">PriceWise</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">購物性價比追蹤</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {phase === 'email' ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">登入 / 註冊</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">輸入 Email 收取驗證碼</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
                />
              </div>
              {error && (
                <p className="text-sm text-[var(--color-error)]">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium text-base disabled:opacity-50 transition-opacity"
              >
                {isLoading ? '發送中...' : '發送驗證碼'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">輸入驗證碼</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                  已發送至 <span className="font-medium text-[var(--color-text)]">{email}</span>
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="otp" className="text-sm font-medium text-[var(--color-text)]">
                  驗證碼
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base tracking-widest text-center"
                />
              </div>
              {error && (
                <p className="text-sm text-[var(--color-error)]">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium text-base disabled:opacity-50 transition-opacity"
              >
                {isLoading ? '驗證中...' : '登入'}
              </button>
              <button
                type="button"
                onClick={() => { setPhase('email'); setOtp(''); setError('') }}
                className="text-sm text-[var(--color-text-muted)] text-center"
              >
                使用其他 Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
