"use client"

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { HubSectionHeader } from '@/components/home/HubOpportunityCards'
import { TopPerformersShowcase } from '@/components/mock-tests/TopPerformersShowcase'
import type { TopPerformerHighlight } from '@/components/mock-tests/topPerformerUtils'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'

export function HubTopPerformersSection() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { openLoginModal } = useAuthLoginModal()
  const isStudent = isAuthenticated && user?.user_type === 'student'

  const [highlights, setHighlights] = useState<TopPerformerHighlight[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const top = await apiClient.getMockTestTopPerformerHighlights().catch(() => [])
      setHighlights(Array.isArray(top) ? top : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleSelectTest = (mockTestId: string) => {
    const path = `/dashboard/student/mock-tests/${mockTestId}/top-performers`
    if (isStudent) {
      router.push(path)
      return
    }
    openLoginModal({ redirect: path, preferredType: 'student' })
  }

  return (
    <section id="hub-top-performers" className="scroll-mt-28">
      <HubSectionHeader
        title="Top Performers"
        viewAllHref="/mock-tests"
        viewAllLabel="Practice Tests"
        subtitle="Highest scores on published practice tests across Disha."
      />
      <TopPerformersShowcase
        highlights={highlights}
        isLoading={loading}
        variant="landing"
        onSelectTest={handleSelectTest}
      />
    </section>
  )
}
