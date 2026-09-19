'use client'

import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { ContactSupportContent } from '@/components/contact/ContactSupportContent'

export default function CorporateContactSupportPage() {
  return (
    <CorporateDashboardLayout>
      <div className="mx-auto max-w-6xl">
        <ContactSupportContent variant="dashboard" />
      </div>
    </CorporateDashboardLayout>
  )
}
