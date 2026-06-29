"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { BulkEmailManagement } from '@/components/dashboard/admin/bulk-email/BulkEmailManagement'
import { LoadingOverlay } from '@/components/dashboard/LoadingOverlay'
import { useAuth } from '@/hooks/useAuth'

export default function AdminBulkEmailPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && user?.user_type !== 'admin') {
            router.push('/dashboard')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return <LoadingOverlay />
    }

    if (user?.user_type !== 'admin') {
        return null
    }

    return (
        <AdminDashboardLayout>
            <BulkEmailManagement />
        </AdminDashboardLayout>
    )
}
