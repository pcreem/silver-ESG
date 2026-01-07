'use client'

import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { Avatar } from '@/components/ui/Avatar'
import {
  Calendar, Clock, TrendingUp, Heart, Utensils, AlertCircle, Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const nutritionData = [
  { name: '蛋白質', value: 25, color: '#10b981' },
  { name: '碳水化合物', value: 45, color: '#8b5cf6' },
  { name: '脂肪', value: 30, color: '#f59e0b' },
]

const weeklyMeals = [
  { day: '一', meals: 3, status: 'completed' },
  { day: '二', meals: 3, status: 'completed' },
  { day: '三', meals: 2, status: 'pending' },
  { day: '四', meals: 0, status: 'upcoming' },
  { day: '五', meals: 0, status: 'upcoming' },
  { day: '六', meals: 0, status: 'upcoming' },
  { day: '日', meals: 0, status: 'upcoming' },
]

const healthTips = [
  { icon: Heart, title: '注意水分補充', desc: '每日建議飲水量 1500-2000ml' },
  { icon: Activity, title: '適度運動', desc: '每日散步 30 分鐘促進血液循環' },
  { icon: AlertCircle, title: '鈣質攝取', desc: '多食用乳製品預防骨質疏鬆' },
]

export default function DashboardPage() {
  const router = useRouter()
  const today = new Date().toLocaleDateString('zh-TW', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container space-y-6"
    >
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">{today}</p>
            <h1 className="text-2xl font-bold mt-1">王先生，早安！</h1>
            <p className="text-primary-100 mt-2">祝您今天身心愉快，飲食健康。</p>
          </div>
          <Avatar fallback="王" size="xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600">本週餐點</p>
                  <p className="text-2xl font-bold text-emerald-700">8 / 21</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-violet-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-violet-600">營養評分</p>
                  <p className="text-2xl font-bold text-violet-700">92 分</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-amber-600">下次配送</p>
                  <p className="text-2xl font-bold text-amber-700">明天 11:00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary-500" />
              <span>本週營養攝取</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={nutritionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {nutritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              {nutritionData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-neutral-600">{item.name} {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              <span>本週配送行程</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              {weeklyMeals.map((day) => (
                <div key={day.day} className="text-center">
                  <div className="text-xs text-neutral-500 mb-1">{day.day}</div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${day.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${day.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                    ${day.status === 'upcoming' ? 'bg-neutral-100 text-neutral-400' : ''}
                  `}>
                    {day.meals}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span>健康小提醒</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthTips.map((tip, index) => {
              const Icon = tip.icon
              return (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="font-medium text-neutral-800">{tip.title}</span>
                  </div>
                  <p className="text-sm text-neutral-600">{tip.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => router.push('/menu')} className="flex-1 min-w-[150px]">
          <Utensils className="w-4 h-4 mr-2" />
          瀏覽餐點
        </Button>
        <Button variant="outline" onClick={() => router.push('/cart')} className="flex-1 min-w-[150px]">
          <Calendar className="w-4 h-4 mr-2" />
          預約配送
        </Button>
        <Button variant="secondary" onClick={() => router.push('/dashboard')} className="flex-1 min-w-[150px]">
          <AlertCircle className="w-4 h-4 mr-2" />
          健康紀錄
        </Button>
      </div>
    </motion.div>
  )
}
