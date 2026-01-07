// Profile type definition (matches backend ProfileRead schema)
export interface Profile {
  id: string
  user_id: string
  name: string
  age: number
  gender: string
  height: number
  weight: number
  chronic_diseases: string[]
  dietary_restrictions: string[]
  chewing_ability: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// MenuItem type definition (matches backend MenuItemRead schema)
export interface MenuItem {
  id: number
  name: string
  description?: string
  suitable_for: string[]
  image_url?: string
  nutrition: Record<string, unknown>
  price: number // Unit: cents
  category?: string
  available: boolean
  ingredients?: string[]
  created_at: string
}

// Order item type definition
export interface OrderItem {
  menu_item_id: number
  quantity: number
  special_instructions?: string
}

// Order type definition (matches backend OrderRead schema)
export interface Order {
  id: string
  profile_id: string
  items: OrderItem[]
  total_amount: number // Unit: cents
  status: string
  stripe_session_id?: string
  checkout_url?: string
  created_at: string
  updated_at: string
}

// Order creation request type
export interface OrderCreateRequest {
  profile_id: string
  items: { menu_item_id: number; quantity: number; special_instructions?: string }[]
  total_amount: number // Unit: cents
}

// Chat message type
export interface ChatMessage {
  message: string
  profile_id?: string
}

// Chat response type
export interface ChatResponse {
  message: string
  session_id: string
  recommendations?: Record<string, unknown>[]
  metadata?: Record<string, unknown>
}

// Dashboard data type
export interface DashboardData {
  weekly_heatmap: { date: string; count: number }[]
  nutrition_stats: { category: string; percentage: number }[]
}

// Donation type definition
export interface Donation {
  id: string
  user_id?: string
  amount: number // Unit: cents
  donor_name?: string
  status: string
  stripe_session_id?: string
  checkout_url?: string
  created_at: string
  updated_at: string
}

// API Response wrapper type
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}
