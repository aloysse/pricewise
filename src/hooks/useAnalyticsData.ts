import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export type AnalyticsRawItem = {
  name: string
  unit: string
  unit_price: number
  purchase_id: string
  purchases: {
    id: string
    purchase_date: string
    store_name: string | null
    total_amount: number | null
  } | null
}

export function useAnalyticsData() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['analytics', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('name, unit, unit_price, purchase_id, purchases(id, purchase_date, store_name, total_amount)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as AnalyticsRawItem[]
    },
  })
}
