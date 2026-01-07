# Silver Table Assistant - Frontend

銀髮餐桌助手 - 前端應用程式

## 線上展示

- **生產環境**：https://silver-esg.vercel.app/dashboard
- **後端 API**：https://huggingface.co/spaces/pcreem/silver

## 專案簡介

這是銀髮餐桌助手的前端應用程式，專為台灣高齡族群設計的智慧營養餐飲服務平台。

### 主要功能

- **AI 營養顧問**：與 AI 對話獲取個人化營養建議
- **長輩檔案管理**：管理長輩的健康資訊與飲食需求
- **餐點瀏覽與訂購**：瀏覽菜單並加入購物車下單
- **購物車**：管理餐點並進行結帳
- **營養儀表板**：追蹤每日營養攝取狀況

## 技術堆疊

- **框架**：Next.js 14 (App Router)
- **語言**：TypeScript
- **UI 樣式**：Tailwind CSS
- **狀態管理**：Zustand
- **動畫**：Framer Motion
- **身份驗證**：Supabase Auth
- **API 通訊**：Axios + 自定義 API Client

## 目錄結構

```
frontend/
├── public/                  # 靜態資源
├── src/
│   ├── app/                 # Next.js App Router 頁面
│   │   ├── page.tsx         # 首頁
│   │   ├── menu/            # 餐點選單頁面
│   │   ├── cart/            # 購物車頁面
│   │   ├── chat/            # AI 營養對話頁面
│   │   ├── dashboard/       # 營養儀表板
│   │   ├── profile/         # 長輩檔案管理
│   │   ├── login/           # 登入頁面
│   │   ├── register/        # 註冊頁面
│   │   └── order/           # 訂單相關頁面
│   ├── components/          # React 元件
│   │   ├── ui/              # UI 元件庫 (Button, Card, Input 等)
│   │   └── layout/          # 版面元件 (Navbar 等)
│   ├── lib/                 # 工具函式庫
│   │   ├── api.ts           # API 客戶端
│   │   ├── auth-api.ts      # Supabase Auth 配置
│   │   ├── supabase.ts      # Supabase 客戶端
│   │   ├── format.ts        # 格式化工具
│   │   └── utils.ts         # 通用工具函式
│   ├── store/               # Zustand 狀態管理
│   │   ├── authStore.ts     # 認證狀態
│   │   └── cartStore.ts     # 購物車狀態
│   └── types/               # TypeScript 類型定義
├── tailwind.config.ts       # Tailwind 配置
├── next.config.js           # Next.js 配置
├── package.json
└── tsconfig.json
```

## 快速開始

### 前置需求

- Node.js 18+
- npm 或 yarn

### 安裝依賴

```bash
cd frontend
npm install
```

### 環境變數

複製環境變數範例檔案並填入必要配置：

```bash
cp .env.local.example .env.local
```

必要環境變數：

```env
# API 設定
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (可選)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 啟動開發伺服器

```bash
npm run dev
```

應用程式將在 http://localhost:3000 啟動。

### 建構生產版本

```bash
npm run build
npm run start
```

## 主要頁面

| 路由 | 功能說明 |
|------|---------|
| `/` | 首頁 |
| `/menu` | 餐點選單 |
| `/cart` | 購物車與結帳 |
| `/chat` | AI 營養顧問對話 |
| `/dashboard` | 營養儀表板 |
| `/profile` | 長輩檔案管理 |
| `/login` | 使用者登入 |
| `/register` | 使用者註冊 |
| `/order/success` | 訂單成功頁面 |
| `/order/cancel` | 訂單取消頁面 |

## API 整合

前端透過 `src/lib/api.ts` 中的 `ApiClient` 類別與後端 API 通訊：

```typescript
import { api } from '@/lib/api'

// 取得餐點列表
const menuItems = await api.getMenu()

// 取得長輩檔案
const profiles = await api.getProfiles()

// 建立訂單
const order = await api.createOrder(orderData)
```

## 身份驗證流程

1. 使用 Supabase Auth 進行使用者認證
2. 登入成功後取得 access_token
3. Token 儲存於 localStorage 並透過 Axios interceptor 附加到 API 請求
4. Zustand authStore 管理使用者登入狀態

```typescript
// 登入範例
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// 設定 API Token
api.setToken(data.session?.access_token)
```

## 狀態管理

### Auth Store (Zustand)

管理使用者認證狀態：

```typescript
import { useAuthStore } from '@/store/authStore'

const { user, isAuthenticated, login, logout, initialize } = useAuthStore()
```

### Cart Store (Zustand)

管理購物車狀態：

```typescript
import { useCartStore } from '@/store/cartStore'

const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore()
```

## 部署到 Vercel

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 設定環境變數
4. 部署完成後即可訪問

```bash
# 使用 Vercel CLI 部署
npm i -g vercel
vercel
```

## 相關資源

- **後端程式碼**：https://github.com/pcreem/silver (silver_backend/)
- **後端展示**：https://huggingface.co/spaces/pcreem/silver
- **專案文檔**：請參考根目錄的 `PROJECT_DOCUMENTATION.md`

## 授權

本專案為開源專案，採用 MIT 授權條款。

---

**維護團隊**：銀髮餐桌助手開發團隊

**最後更新**：2026年1月
