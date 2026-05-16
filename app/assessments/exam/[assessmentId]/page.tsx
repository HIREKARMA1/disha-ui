'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { Navbar } from '@/components/ui/navbar'
import { Loader2, AlertCircle } from 'lucide-react'
import {
  StudentExamInstructions,
  type PublicExamBrief,
  type StudentExamEligibility,
} from '@/components/assessments/StudentExamInstructions'

export default function StudentExamEntryPage() {
  const params = useParams()
  const assessmentId = params.assessmentId as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [exam, setExam] = useState<PublicExamBrief | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [startError, setStartError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [eligibility, setEligibility] = useState<StudentExamEligibility | null>(null)
  const [eligibilityLoading, setEligibilityLoading] = useState(true)

  const examPath = `/assessments/exam/${assessmentId}`
  const loginUrl = useMemo(
    () => `/auth/login?type=student&redirect=${encodeURIComponent(examPath)}`,
    [examPath]
  )
  const registerUrl = useMemo(
    () => `/auth/register?type=student&redirect=${encodeURIComponent(examPath)}`,
    [examPath]
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!assessmentId) return
      setLoading(true)
      setLoadError(null)
      try {
        const data = await apiClient.getPublicAssessment(assessmentId)
        if (!cancelled) {
          setExam({
            ...data,
            total_questions: data.total_questions ?? 0,
            round_count: data.round_count ?? data.rounds?.length ?? 0,
            rounds: data.rounds ?? [],
          })
        }
      } catch {
        if (!cancelled) {
          setExam(null)
          setLoadError('This exam link is invalid or the assessment is not open for students.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [assessmentId])

  useEffect(() => {
    let cancelled = false
    const loadEligibility = async () => {
      if (!isAuthenticated || user?.user_type !== 'student' || !assessmentId) {
        setEligibility(null)
        setEligibilityLoading(false)
        return
      }
      setEligibilityLoading(true)
      try {
        const data = await apiClient.getAssessmentEligibility(assessmentId)
        if (!cancelled) setEligibility(data)
      } catch {
        if (!cancelled) setEligibility(null)
      } finally {
        if (!cancelled) setEligibilityLoading(false)
      }
    }
    if (!authLoading) loadEligibility()
    return () => {
      cancelled = true
    }
  }, [assessmentId, isAuthenticated, user?.user_type, user?.id, authLoading])

  const handleStartExam = async () => {
    if (!user || user.user_type !== 'student' || !exam || eligibility?.can_start === false) return
    setStartError(null)
    setStarting(true)
    try {
      const res = await apiClient.generateAssessmentToken(assessmentId, {
        student_id: user.id,
        expires_in_minutes: 120,
      })
      if (res?.solviq_url) {
        window.location.href = res.solviq_url as string
        return
      }
      setStartError('Could not start the exam. Please try again.')
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (e as Error)?.message ||
        'Could not start the exam.'
      setStartError(typeof msg === 'string' ? msg : 'Could not start the exam.')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar variant="solid" />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-600 dark:text-gray-400 pt-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          <p className="text-sm font-medium">Loading exam instructions…</p>
        </div>
      ) : loadError || !exam ? (
        <div className="max-w-lg mx-auto px-4 pt-28 pb-12">
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-5 text-amber-900 dark:text-amber-100">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{loadError || 'Exam not available.'}</p>
          </div>
        </div>
      ) : (
        <div className="pt-16">
          <StudentExamInstructions
            exam={exam}
            authLoading={authLoading}
            isAuthenticated={isAuthenticated}
            isStudent={user?.user_type === 'student'}
            loginUrl={loginUrl}
            registerUrl={registerUrl}
            startError={startError}
            starting={starting}
            onStart={handleStartExam}
            eligibility={eligibility}
            eligibilityLoading={eligibilityLoading}
          />
        </div>
      )}
    </div>
  )
}
