import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { SkipLink } from '@/components/SkipLink'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '銀髮族送餐服務 - 專業高齡營養餐點配送',
  description: '為銀髮族量身打造的營養餐點配送服務，提供符合健康需求的美味餐食。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <AuthProvider>
          <SkipLink />
          <Navbar />
          <main id="main-content" className="pt-16 min-h-screen">
            {children}
          </main>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
