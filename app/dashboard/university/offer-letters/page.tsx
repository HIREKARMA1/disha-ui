'use client'

import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { UniversityOfferLetterList } from '@/components/university/UniversityOfferLetterList'

export default function UniversityOfferLettersPage() {
  return (
    <UniversityDashboardLayout>
      <UniversityOfferLetterList />
    </UniversityDashboardLayout>
  )
}
