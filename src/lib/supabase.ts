import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  name: string
  email: string
  age: number
  weight?: number
  height?: number
  chronic_diseases?: string[]
  dietary_restrictions?: string[]
  allergies?: string[]
  created_at: string
}

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  nutrition_info: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  dietary_tags: string[]
}

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export type Order = {
  id: string
  user_id: string
  profile_id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  delivery_date: string
  created_at: string
}
