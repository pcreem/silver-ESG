'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function OrderSuccessPage() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [orderId, setOrderId] = useState<string | null>(null)

    useEffect(() => {
        // In a real app, you would verify the session with your backend
        // and retrieve the order details
        if (sessionId) {
            console.log('Payment successful for session:', sessionId)
            setOrderId(sessionId)
        }
    }, [sessionId])

    return (
        <div className="page-container flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl">付款成功！</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center text-neutral-600">
                        <p>感謝您的訂購。</p>
                        <p className="mt-2">您的訂單已成功建立，我們將盡快為您準備餐點。</p>
                    </div>

                    {sessionId && (
                        <div className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                            <p className="text-neutral-500">訂單編號</p>
                            <p className="font-mono font-medium">{sessionId.slice(0, 8)}...</p>
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <p className="text-sm text-neutral-500 text-center mb-4">
                            我們將發送確認郵件到您的電子郵件地址。
                        </p>
                        <div className="flex flex-col space-y-2">
                            <Link href="/menu">
                                <Button className="w-full" variant="outline">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    繼續點餐
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button className="w-full">
                                    返回首頁
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
