'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function OrderCancelPage() {
    return (
        <div className="page-container flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <XCircle className="w-16 h-16 text-neutral-400" />
                    </div>
                    <CardTitle className="text-2xl">訂單已取消</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center text-neutral-600">
                        <p>您的訂單已被取消。</p>
                        <p className="mt-2">如果您有任何疑問，請聯繫我們的客服團隊。</p>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-sm text-neutral-500 text-center mb-4">
                            您的付款將在24小時內退回至原付款方式。
                        </p>
                        <div className="flex flex-col space-y-2">
                            <Link href="/cart">
                                <Button className="w-full" variant="outline">
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    返回購物車
                                </Button>
                            </Link>
                            <Link href="/menu">
                                <Button className="w-full">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    繼續點餐
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
