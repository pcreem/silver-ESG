'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { motion } from 'framer-motion'
import { Search, Plus, Star, Flame } from 'lucide-react'
import { mockMenuItems } from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'

const categories = ['全部', '主食', '主菜', '湯品', '配菜', '甜點', '飲料']
const filters = ['全部', '軟質', '低鹽', '糖尿病友善', '高蛋白', '高纖']

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedFilter, setSelectedFilter] = useState('全部')

  const filteredItems = mockMenuItems.filter((item) => {
    const matchesSearch =
      item.name.includes(searchQuery) ||
      item.description?.includes(searchQuery) ||
      (item.ingredients && item.ingredients.some(i => i.includes(searchQuery)))
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory
    const matchesFilter = selectedFilter === '全部' || (item.suitable_for && item.suitable_for.some(t => t.includes(selectedFilter)))
    return matchesSearch && matchesCategory && matchesFilter
  })

  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (item: typeof mockMenuItems[0]) => {
    addItem({
      id: String(item.id),
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image_url,
    })
    alert(`已將「${item.name}」加入購物車！`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">餐點目錄</h1>
          <p className="text-gray-600 mt-1">精選適合長輩的營養餐點</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋餐點名稱或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                selectedCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">篩選：</span>
          <div className="flex space-x-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  selectedFilter === filter
                    ? 'bg-secondary-100 text-secondary-700 border border-secondary-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="overflow-hidden h-full">
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <div className="absolute top-3 right-3 flex space-x-1">
                    {item.suitable_for?.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-white/80 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <span className="text-lg font-bold text-primary-600">{formatCurrency(item.price)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                    {item.ingredients && (
                      <span>主要食材: {item.ingredients.slice(0, 2).join(', ')}</span>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    加入購物車
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">沒有找到符合條件的餐點</h3>
            <p className="text-gray-600">請嘗試調整搜尋條件或過濾器</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
