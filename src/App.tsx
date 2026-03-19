import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/Layout'
import LoginPage from '@/components/Auth/LoginPage'
import HomePage from '@/pages/Home'
import NewPurchasePage from '@/pages/NewPurchase'
import AnalyticsPage from '@/pages/Analytics'
import SettingsPage from '@/pages/Settings'
import NotFoundPage from '@/pages/NotFound'

function LoadingScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)]">
      <div className="w-10 h-10 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
    </div>
  )
}

export default function App() {
  const { session, isLoading, setUser, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading])

  if (isLoading) return <LoadingScreen />

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/"
        element={session ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<HomePage />} />
        <Route path="new" element={<NewPurchasePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
