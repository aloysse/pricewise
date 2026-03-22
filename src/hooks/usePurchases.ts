import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Purchase, Item } from '@/types/database.types'

export type PurchaseWithItems = Purchase & { items: Item[] }

export function usePurchases() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['purchases', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, items(*)')
        .order('purchase_date', { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []) as PurchaseWithItems[]
    },
  })
}
