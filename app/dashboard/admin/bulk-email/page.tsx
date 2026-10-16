"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { BulkEmailManagement } from '@/components/dashboard/admin/bulk-email/BulkEmailManagement'
import { LoadingOverlay } from '@/components/dashboard/LoadingOverlay'
import { useAuth } from '@/hooks/useAuth'
import { canUseExecutiveModule } from '@/lib/executiveModules'

export default function AdminBulkEmailPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !canUseExecutiveModule(user, 'bulk_mail')) {
            router.push('/dashboard')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return <LoadingOverlay />
    }

    if (!canUseExecutiveModule(user, 'bulk_mail')) {
        return null
    }

    return (
        <AdminDashboardLayout>
            <BulkEmailManagement />
        </AdminDashboardLayout>
    )
}
