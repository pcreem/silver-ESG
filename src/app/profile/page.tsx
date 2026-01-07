'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Profile } from '@/types'

// Predefined options for chronic diseases and dietary restrictions
const CHRONIC_DISEASE_OPTIONS = [
  '糖尿病', '高血壓', '心臟病', '腎臟病', '肝病',
  '肺氣腫', '關節炎', '骨質疏鬆', '失智症', '中風後遺症'
]

const DIETARY_RESTRICTION_OPTIONS = [
  '低糖', '低鈉', '低脂', '高蛋白', '高纖維',
  '無麩質', '素食', '蛋奶素', '避免海鮮', '避免堅果'
]

export default function ProfilePage() {
  const { user, isAuthenticated, initialize } = useAuthStore()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [newDisease, setNewDisease] = useState('')
  const [newRestriction, setNewRestriction] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'female' as 'male' | 'female',
    height: '',
    weight: '',
    chewing_ability: 'normal' as 'normal' | 'soft' | 'pureed',
    chronic_diseases: [] as string[],
    dietary_restrictions: [] as string[],
  })

  // Initialize auth store and load profiles from backend on mount
  useEffect(() => {
    console.log('[Profile] useEffect triggered, isAuthenticated:', isAuthenticated, ', user:', user?.id)

    const initAndLoad = async () => {
      await initialize()
      setInitialized(true)

      if (isAuthenticated) {
        loadProfiles()
      } else {
        // Clear profiles when not authenticated
        setProfiles([])
        setLoading(false)
      }
    }

    initAndLoad()
  }, [isAuthenticated, initialize])

  const loadProfiles = async () => {
    try {
      setLoading(true)
      console.log('[Profile] Loading profiles...')
      const data = await api.getProfiles()
      console.log('[Profile] Profiles loaded:', data.length)
      setProfiles(data)
    } catch (error) {
      console.error('[Profile] Failed to load profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100
    return (weight / (heightInMeters * heightInMeters)).toFixed(1)
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: '體重過輕', color: 'text-blue-600' }
    if (bmi < 24) return { text: '正常範圍', color: 'text-green-600' }
    if (bmi < 27) return { text: '體重過重', color: 'text-yellow-600' }
    return { text: '肥胖', color: 'text-red-600' }
  }

  const addDisease = (disease: string) => {
    if (disease && !formData.chronic_diseases.includes(disease)) {
      setFormData({
        ...formData,
        chronic_diseases: [...formData.chronic_diseases, disease],
      })
      setNewDisease('')
    }
  }

  const removeDisease = (disease: string) => {
    setFormData({
      ...formData,
      chronic_diseases: formData.chronic_diseases.filter(d => d !== disease),
    })
  }

  const addRestriction = (restriction: string) => {
    if (restriction && !formData.dietary_restrictions.includes(restriction)) {
      setFormData({
        ...formData,
        dietary_restrictions: [...formData.dietary_restrictions, restriction],
      })
      setNewRestriction('')
    }
  }

  const removeRestriction = (restriction: string) => {
    setFormData({
      ...formData,
      dietary_restrictions: formData.dietary_restrictions.filter(r => r !== restriction),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const profileData = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      chewing_ability: formData.chewing_ability,
      chronic_diseases: formData.chronic_diseases,
      dietary_restrictions: formData.dietary_restrictions,
    }

    try {
      if (editingProfile) {
        // Update existing profile
        const updated = await api.updateProfile(editingProfile.id, profileData)
        setProfiles(profiles.map(p => p.id === editingProfile.id ? { ...updated, id: String(updated.id) } : p))
      } else {
        // Create new profile
        const created = await api.createProfile(profileData)
        setProfiles([...profiles, { ...created, id: String(created.id) }])
      }

      setShowForm(false)
      setEditingProfile(null)
      setFormData({
        name: '',
        age: '',
        gender: 'female',
        height: '',
        weight: '',
        chewing_ability: 'normal',
        chronic_diseases: [],
        dietary_restrictions: [],
      })
      setNewDisease('')
      setNewRestriction('')
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('儲存失敗，請稍後再試')
    }
  }

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile)
    setFormData({
      name: profile.name,
      age: profile.age.toString(),
      gender: profile.gender as 'male' | 'female',
      height: profile.height.toString(),
      weight: profile.weight.toString(),
      chewing_ability: profile.chewing_ability as 'normal' | 'soft' | 'pureed',
      chronic_diseases: profile.chronic_diseases || [],
      dietary_restrictions: profile.dietary_restrictions || [],
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('確定要刪除此長輩檔案嗎？')) {
      try {
        await api.deleteProfile(id)
        setProfiles(profiles.filter(p => p.id !== id))
      } catch (error) {
        console.error('Failed to delete profile:', error)
        alert('刪除失敗，請稍後再試')
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Card>
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">需要登入</h2>
            <p className="text-gray-600 mb-6">請先登入以管理長輩檔案</p>
            <Button onClick={() => window.location.href = '/login'}>
              前往登入
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {editingProfile ? '編輯長輩檔案' : '新增長輩檔案'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="請輸入姓名"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="年齡"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="請輸入年齡"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">性別</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="female">女性</option>
                    <option value="male">男性</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="身高 (cm)"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="請輸入身高"
                  required
                />

                <Input
                  label="體重 (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="請輸入體重"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">咀嚼能力</label>
                <select
                  value={formData.chewing_ability}
                  onChange={(e) => setFormData({ ...formData, chewing_ability: e.target.value as 'normal' | 'soft' | 'pureed' })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="normal">正常咀嚼</option>
                  <option value="soft">軟質食物</option>
                  <option value="pureed">泥狀食物</option>
                </select>
              </div>

              {/* Chronic Diseases Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">慢性疾病</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.chronic_diseases.map((disease, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full flex items-center gap-1"
                    >
                      {disease}
                      <button
                        type="button"
                        onClick={() => removeDisease(disease)}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={newDisease}
                    onChange={(e) => setNewDisease(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">選擇慢性疾病</option>
                    {CHRONIC_DISEASE_OPTIONS.filter(d => !formData.chronic_diseases.includes(d)).map((disease) => (
                      <option key={disease} value={disease}>{disease}</option>
                    ))}
                  </select>
                  <Button type="button" onClick={() => addDisease(newDisease)} disabled={!newDisease}>
                    新增
                  </Button>
                </div>
              </div>

              {/* Dietary Restrictions Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">飲食禁忌/過敏</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.dietary_restrictions.map((restriction, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full flex items-center gap-1"
                    >
                      {restriction}
                      <button
                        type="button"
                        onClick={() => removeRestriction(restriction)}
                        className="hover:text-yellow-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={newRestriction}
                    onChange={(e) => setNewRestriction(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">選擇飲食禁忌</option>
                    {DIETARY_RESTRICTION_OPTIONS.filter(r => !formData.dietary_restrictions.includes(r)).map((restriction) => (
                      <option key={restriction} value={restriction}>{restriction}</option>
                    ))}
                  </select>
                  <Button type="button" onClick={() => addRestriction(newRestriction)} disabled={!newRestriction}>
                    新增
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit">
                  {editingProfile ? '儲存變更' : '新增'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingProfile(null); }}>
                  取消
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">長輩檔案</h1>
            <p className="text-gray-600 mt-1">管理長輩的健康資訊和飲食需求</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadProfiles}>
              🔄 重新整理
            </Button>
            <Button onClick={() => setShowForm(true)}>
              + 新增長輩
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const bmi = calculateBMI(profile.weight, profile.height)
            const bmiStatus = getBMIStatus(parseFloat(bmi))

            return (
              <Card key={profile.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                      {profile.gender === 'male' ? '👴' : '👵'}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
                      <p className="text-sm text-gray-500">{profile.age} 歲</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(profile)} className="p-2 text-gray-400 hover:text-primary-500">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(profile.id)} className="p-2 text-gray-400 hover:text-red-500">
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">身高體重</span>
                    <span className="text-gray-800">{profile.height}cm / {profile.weight}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">BMI</span>
                    <span className={`font-medium ${bmiStatus.color}`}>{bmi} ({bmiStatus.text})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">咀嚼能力</span>
                    <span className="text-gray-800">
                      {profile.chewing_ability === 'normal' ? '正常' : profile.chewing_ability === 'soft' ? '軟質食物' : '泥狀食物'}
                    </span>
                  </div>

                  {profile.chronic_diseases && profile.chronic_diseases.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-500 text-xs">慢性疾病</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.chronic_diseases.map((disease, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            {disease}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-500 text-xs">飲食禁忌</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.dietary_restrictions.map((restriction, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👴</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">還沒有長輩檔案</h3>
            <p className="text-gray-600 mb-6">點擊下方按鈕新增第一個長輩檔案</p>
            <Button onClick={() => setShowForm(true)}>
              新增長輩
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
