// Auto-generated shape for Supabase database
// Run `supabase gen types typescript --local > src/types/database.types.ts` to regenerate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          barcode: string | null
          default_unit: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          barcode?: string | null
          default_unit?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          barcode?: string | null
          default_unit?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          store_name: string | null
          purchase_date: string
          total_amount: number | null
          photo_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          store_name?: string | null
          purchase_date?: string
          total_amount?: number | null
          photo_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          store_name?: string | null
          purchase_date?: string
          total_amount?: number | null
          photo_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          purchase_id: string
          product_id: string | null
          name: string
          quantity: number
          unit: string
          unit_price: number
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          purchase_id: string
          product_id?: string | null
          name: string
          quantity: number
          unit: string
          unit_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          purchase_id?: string
          product_id?: string | null
          name?: string
          quantity?: number
          unit?: string
          unit_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      price_history: {
        Row: {
          id: string
          product_id: string
          item_id: string | null
          store_name: string | null
          quantity: number
          unit: string
          unit_price: number
          purchase_date: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          item_id?: string | null
          store_name?: string | null
          quantity: number
          unit: string
          unit_price: number
          purchase_date: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          item_id?: string | null
          store_name?: string | null
          quantity?: number
          unit?: string
          unit_price?: number
          purchase_date?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Named Row types
export type Product = Tables<'products'>
export type Purchase = Tables<'purchases'>
export type Item = Tables<'items'>
export type PriceHistory = Tables<'price_history'>

// Named Insert types
export type ProductInsert = TablesInsert<'products'>
export type PurchaseInsert = TablesInsert<'purchases'>
export type ItemInsert = TablesInsert<'items'>
export type PriceHistoryInsert = TablesInsert<'price_history'>

// Named Update types
export type ProductUpdate = TablesUpdate<'products'>
export type PurchaseUpdate = TablesUpdate<'purchases'>
export type ItemUpdate = TablesUpdate<'items'>
export type PriceHistoryUpdate = TablesUpdate<'price_history'>
