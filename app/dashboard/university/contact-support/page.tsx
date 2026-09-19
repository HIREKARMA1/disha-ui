'use client'

import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { ContactSupportContent } from '@/components/contact/ContactSupportContent'

export default function UniversityContactSupportPage() {
  return (
    <UniversityDashboardLayout>
      <div className="mx-auto max-w-6xl">
        <ContactSupportContent variant="dashboard" />
      </div>
    </UniversityDashboardLayout>
  )
}
