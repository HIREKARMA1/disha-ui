'use client'

import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { ContactSupportContent } from '@/components/contact/ContactSupportContent'

export default function StudentContactSupportPage() {
  return (
    <StudentDashboardLayout>
      <div className="mx-auto max-w-6xl">
        <ContactSupportContent variant="dashboard" />
      </div>
    </StudentDashboardLayout>
  )
}
