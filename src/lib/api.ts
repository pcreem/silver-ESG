// API client for backend integration
import type {
  MenuItem,
  Profile,
  Order,
  OrderCreateRequest,
  ChatResponse,
  DashboardData,
  Donation,
  ApiResponse,
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

/**
 * Converts a UUID object or string to a string
 */
function uuidToString(uuid: string | { hex: string } | unknown): string {
  if (typeof uuid === 'string') return uuid
  if (uuid && typeof uuid === 'object' && 'hex' in uuid) {
    return (uuid as { hex: string }).hex
  }
  return String(uuid)
}

/**
 * Handles API response - unwraps if wrapped in ApiResponse<T>
 */
function handleResponse<T>(data: T | ApiResponse<T>): T {
  if (data && typeof data === 'object' && 'success' in data) {
    const response = data as ApiResponse<T>
    if (response.data !== undefined) {
      return response.data
    }
  }
  return data as T
}

/**
 * Converts amount from yuan to cents (multiply by 100)
 */
function yuanToCents(yuan: number): number {
  return Math.round(yuan * 100)
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return handleResponse(data)
  }

  // Menu APIs
  async getMenu(): Promise<MenuItem[]> {
    return this.request<MenuItem[]>('/menu')
  }

  async getMenuItem(id: number): Promise<MenuItem> {
    return this.request<MenuItem>(`/menu/${id}`)
  }

  // Profile APIs
  async getProfiles(): Promise<Profile[]> {
    return this.request<Profile[]>('/profiles')
  }

  async getProfile(id: string): Promise<Profile> {
    const profile = await this.request<Profile>(`/profiles/${id}`)
    // Convert UUID to string
    if (profile.id) {
      profile.id = uuidToString(profile.id)
    }
    if (profile.user_id) {
      profile.user_id = uuidToString(profile.user_id)
    }
    return profile
  }

  async createProfile(data: Partial<Profile>): Promise<Profile> {
    // Remove read-only fields
    const { id, user_id, created_at, updated_at, ...createData } = data as Partial<Profile> & Record<string, unknown>
    return this.request<Profile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(createData),
    })
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    // Remove read-only fields
    const { id: _id, user_id, created_at, updated_at, ...updateData } = data as Partial<Profile> & Record<string, unknown>
    return this.request<Profile>(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  }

  async deleteProfile(id: string): Promise<void> {
    await this.request(`/profiles/${id}`, { method: 'DELETE' })
  }

  // Order APIs
  async createOrder(data: OrderCreateRequest): Promise<{ checkout_url: string }> {
    // Convert amount from yuan to cents
    const orderData = {
      ...data,
      total_amount: yuanToCents(data.total_amount),
    }
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getOrders(profileId: string): Promise<Order[]> {
    const orders = await this.request<Order[]>(`/orders?profile_id=${profileId}`)
    // Convert UUIDs to strings
    return orders.map((order) => ({
      ...order,
      id: uuidToString(order.id),
      profile_id: uuidToString(order.profile_id),
    }))
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.request<Order>(`/orders/${id}`)
    // Convert UUIDs to strings
    return {
      ...order,
      id: uuidToString(order.id),
      profile_id: uuidToString(order.profile_id),
    }
  }

  // Chat APIs
  async sendChatMessage(message: string, profileId?: string): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, profile_id: profileId }),
    })
  }

  // Dashboard APIs
  async getDashboardData(profileId: string): Promise<DashboardData> {
    return this.request<DashboardData>(`/dashboard/${profileId}`)
  }

  // Donation APIs
  async createDonation(data: {
    amount: number
    donor_name?: string
    message?: string
  }): Promise<{ checkout_url: string }> {
    // Convert amount from yuan to cents
    const donationData = {
      ...data,
      amount: yuanToCents(data.amount),
    }
    return this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    })
  }
}

export const api = new ApiClient(API_BASE_URL)

// Mock data for development (updated to match backend schema)
export const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: '營養雞肉粥',
    description: '軟嫩雞肉絲配白粥，適合咀嚼能力較弱的長輩',
    suitable_for: ['軟質食物', '糖尿病友善', '高血壓友善'],
    image_url: 'https://images.unsplash.com/photo-1511690656952-34342d5c28b5?w=300&h=200&fit=crop',
    nutrition: { calories: 350, protein: 15, carbs: 45, fat: 8 },
    price: 12000, // 120 yuan = 12000 cents
    category: '粥品',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: '清蒸鯛魚豆腐',
    description: '新鮮鯛魚配嫩豆腐，富含優質蛋白質',
    suitable_for: ['正常咀嚼', '高血壓友善', '低鈉料理'],
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop',
    nutrition: { calories: 280, protein: 25, carbs: 8, fat: 12 },
    price: 15000, // 150 yuan = 15000 cents
    category: '主菜',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: '南瓜濃湯',
    description: '綿密南瓜泥製成，富含維生素A',
    suitable_for: ['泥狀食物', '糖尿病友善'],
    image_url: 'https://images.unsplash.com/photo-1476718408415-7108dad62fdd?w=300&h=200&fit=crop',
    nutrition: { calories: 180, protein: 4, carbs: 25, fat: 6 },
    price: 8000, // 80 yuan = 8000 cents
    category: '湯品',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: '菠菜蛋花湯',
    description: '新鮮菠菜配嫩蛋花，補鐵聖品',
    suitable_for: ['正常咀嚼', '軟質食物', '高血壓友善'],
    image_url: 'https://images.unsplash.com/photo-1547592166-23acbe3b624b?w=300&h=200&fit=crop',
    nutrition: { calories: 120, protein: 8, carbs: 5, fat: 7 },
    price: 6000, // 60 yuan = 6000 cents
    category: '湯品',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: '紅棗銀耳湯',
    description: '溫潤甜湯，滋潤養顏',
    suitable_for: ['所有咀嚼能力', '糖尿病友善'],
    image_url: 'https://images.unsplash.com/photo-1511690656952-34342d5c28b5?w=300&h=200&fit=crop',
    nutrition: { calories: 200, protein: 2, carbs: 40, fat: 2 },
    price: 7000, // 70 yuan = 7000 cents
    category: '甜湯',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: '香菇肉燥飯',
    description: '台式經典，軟爛肉燥配白飯',
    suitable_for: ['正常咀嚼', '軟質食物'],
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop',
    nutrition: { calories: 450, protein: 18, carbs: 55, fat: 14 },
    price: 10000, // 100 yuan = 10000 cents
    category: '主食',
    available: true,
    created_at: new Date().toISOString(),
  },
]

export const mockNutritionData = {
  weekly_heatmap: [
    { date: '2024-01-01', count: 2 },
    { date: '2024-01-02', count: 3 },
    { date: '2024-01-03', count: 1 },
    { date: '2024-01-04', count: 4 },
    { date: '2024-01-05', count: 2 },
    { date: '2024-01-06', count: 3 },
    { date: '2024-01-07', count: 5 },
  ],
  nutrition_stats: [
    { category: '蛋白質', percentage: 85 },
    { category: '維生素', percentage: 72 },
    { category: '礦物質', percentage: 68 },
    { category: '纖維質', percentage: 90 },
    { category: '水分', percentage: 78 },
    { category: '熱量', percentage: 82 },
  ],
}
