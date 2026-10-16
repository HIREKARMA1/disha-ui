"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { BulkWhatsAppManagement } from '@/components/dashboard/admin/bulk-whatsapp/BulkWhatsAppManagement'
import { LoadingOverlay } from '@/components/dashboard/LoadingOverlay'
import { useAuth } from '@/hooks/useAuth'
import { canUseExecutiveModule } from '@/lib/executiveModules'

export default function AdminBulkWhatsAppPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !canUseExecutiveModule(user, 'bulk_whatsapp')) {
            router.push('/dashboard')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return <LoadingOverlay />
    }

    if (!canUseExecutiveModule(user, 'bulk_whatsapp')) {
        return null
    }

    return (
        <AdminDashboardLayout>
            <BulkWhatsAppManagement />
        </AdminDashboardLayout>
    )
}
