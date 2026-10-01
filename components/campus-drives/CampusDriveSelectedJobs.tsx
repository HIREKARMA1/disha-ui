'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { JobCard } from '@/components/dashboard/JobCard'
import { CampusDriveInterestModal } from '@/components/jobs/CampusDriveInterestModal'
import { PostQuickApplySkillsNudgeDialog } from '@/components/jobs/PostQuickApplySkillsNudgeDialog'
import { QuickApplyModal } from '@/components/jobs/QuickApplyModal'
import type { Job } from '@/components/jobs/AllJobs'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import {
  getJobInterestModalCopy,
  isJobInterestGateMessage,
  resolveCampusDriveInterestOutcome,
  resolveJobInterestModalKind,
  submitCampusDriveInterest,
  toastCampusDriveRequestStatus,
  getCampusDriveRequestApplyOverride,
  type JobInterestModalKind,
} from '@/lib/campusDriveInterest'
import { getJobDetailPath } from '@/lib/jobSlug'
import {
  CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE,
  getPassoutBatchApplyEligibility,
  getUniversityApplyEligibility,
  JOB_CLOSED_MESSAGE,
  PASSOUT_BATCH_NOT_ELIGIBLE_MESSAGE,
} from '@/lib/jobApplicationMessages'
import { prepareGuestApplyForLogin } from '@/lib/pendingJobApplication'
import { shouldShowPostApplySkillsNudge } from '@/lib/profileCompletion'
import { profileService } from '@/services/profileService'

function toCardJob(job: Job): Job {
  return {
    ...job,
    id: job.id,
    title: job.title || '',
    description: job.description || '',
    job_type: job.job_type || 'full_time',
    status: job.status || 'active',
    location: Array.isArray(job.location) ? job.location : job.location || '',
    remote_work: Boolean(job.remote_work),
    travel_required: Boolean(job.travel_required),
    salary_currency: job.salary_currency || 'INR',
    max_applications: job.max_applications ?? 0,
    current_applications: job.current_applications ?? 0,
    views_count: job.views_count ?? 0,
    applications_count: job.applications_count ?? 0,
    created_at: job.created_at || '',
    is_active: job.is_active !== false,
    can_apply: Boolean(job.can_apply),
  }
}

export function CampusDriveSelectedJobs({ jobs }: { jobs?: Job[] | null }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { openLoginModal } = useAuthLoginModal()
  const [cardJobs, setCardJobs] = useState<Job[]>(() => (jobs || []).map(toCardJob))
  const [applyJob, setApplyJob] = useState<Job | null>(null)
  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false)
  const [showSkillsNudge, setShowSkillsNudge] = useState(false)
  const [studentUniversityId, setStudentUniversityId] = useState<string | null>(null)
  const [studentGraduationYear, setStudentGraduationYear] = useState<number | null>(null)
  const [studentBatch, setStudentBatch] = useState<string | null>(null)
  const [showCampusDriveInterestModal, setShowCampusDriveInterestModal] = useState(false)
  const [interestModalKind, setInterestModalKind] = useState<JobInterestModalKind>('campus_drive')
  const [interestJobId, setInterestJobId] = useState<string | null>(null)
  const [interestSubmitting, setInterestSubmitting] = useState(false)

  useEffect(() => {
    setCardJobs((jobs || []).map(toCardJob))
  }, [jobs])

  useEffect(() => {
    if (!apiClient.getAccessToken()) return
    profileService
      .getProfile()
      .then((profile) => {
        setStudentUniversityId(profile.university_id || null)
        setStudentGraduationYear(profile.graduation_year ?? null)
        setStudentBatch((profile as { batch?: string }).batch || null)
      })
      .catch(() => undefined)
  }, [])

  const patchJob = (jobId: string, patch: Partial<Job>) => {
    setCardJobs((current) => current.map((item) => (item.id === jobId ? { ...item, ...patch } : item)))
    setApplyJob((current) => (current?.id === jobId ? { ...current, ...patch } : current))
  }

  const handleApply = async (job: Job) => {
    if (!apiClient.getAccessToken()) {
      openLoginModal({
        redirect: prepareGuestApplyForLogin(job.id, getJobDetailPath(job)),
        preferredType: 'student',
      })
      return
    }
    if (job.application_status === 'applied') return

    const requestOverride = getCampusDriveRequestApplyOverride(job.campus_drive_request_status)
    if (requestOverride === 'pending' || requestOverride === 'rejected') {
      toastCampusDriveRequestStatus(
        requestOverride,
        resolveJobInterestModalKind({
          isPublic: job.is_public,
          publicAccessLevel: job.public_access_level,
          isCampusDrive: Boolean(job.is_campus_drive),
        })
      )
      return
    }
    if (!job.can_apply) {
      toast.error(JOB_CLOSED_MESSAGE)
      return
    }

    const isStudent = Boolean(isAuthenticated && user?.user_type === 'student')
    const universityEligibility = getUniversityApplyEligibility({
      isPublic: job.is_public,
      publicAccessLevel: job.public_access_level,
      assignedUniversityIds: job.assigned_university_ids,
      isAuthenticatedStudent: isStudent,
      studentUniversityId,
      isCampusDrive: Boolean(job.is_campus_drive),
      hasAcceptedCampusDriveRequest: job.campus_drive_request_status === 'accepted',
    })
    if (!universityEligibility.canApply) {
      const reason = universityEligibility.reason || CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE
      if (!isJobInterestGateMessage(reason)) {
        toast.error(reason)
        return
      }
      const kind = resolveJobInterestModalKind({
        isPublic: job.is_public,
        publicAccessLevel: job.public_access_level,
        isCampusDrive: Boolean(job.is_campus_drive),
        reason,
      })
      const { outcome } = await resolveCampusDriveInterestOutcome(job.id)
      if (outcome === 'accepted') {
        patchJob(job.id, { campus_drive_request_status: 'accepted' })
      } else if (outcome === 'pending' || outcome === 'rejected') {
        patchJob(job.id, { campus_drive_request_status: outcome })
        toastCampusDriveRequestStatus(outcome, kind)
        return
      } else if (outcome === 'show_interest_modal') {
        setInterestModalKind(kind)
        setInterestJobId(job.id)
        setShowCampusDriveInterestModal(true)
        return
      } else {
        toast.error(reason)
        return
      }
    }

    const batchEligibility = getPassoutBatchApplyEligibility({
      passoutBatches: job.passout_batches,
      isAuthenticatedStudent: isStudent,
      studentGraduationYear,
      studentBatch,
    })
    if (!batchEligibility.canApply) {
      toast.error(batchEligibility.reason || PASSOUT_BATCH_NOT_ELIGIBLE_MESSAGE)
      return
    }

    setApplyJob(job)
    setShowQuickApplyModal(true)
  }

  const handleCampusDriveStillInterested = async () => {
    if (!interestJobId || interestSubmitting) return
    setInterestSubmitting(true)
    try {
      const result = await submitCampusDriveInterest(interestJobId)
      if (result.ok) {
        setShowCampusDriveInterestModal(false)
        if (result.status) {
          patchJob(interestJobId, { campus_drive_request_status: result.status })
        }
        setInterestJobId(null)
      }
    } finally {
      setInterestSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Briefcase className="h-5 w-5" /> Campus Drive Jobs
      </h2>
      {cardJobs.length ? (
        <div className="grid grid-cols-1 gap-3.5">
          {cardJobs.map((job, index) => (
            <JobCard
              key={job.id}
              job={job}
              cardIndex={index}
              compactMobile
              onViewDescription={() => router.push(getJobDetailPath(job))}
              onApply={() => void handleApply(job)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No jobs are attached to this campus drive.</p>
      )}

      {showQuickApplyModal && applyJob && (
        <QuickApplyModal
          job={applyJob}
          onClose={() => {
            setShowQuickApplyModal(false)
            setApplyJob(null)
          }}
          onSuccess={() => {
            if (!applyJob) return
            patchJob(applyJob.id, { application_status: 'applied', can_apply: false })
            setShowQuickApplyModal(false)
            setApplyJob(null)
            void (async () => {
              try {
                const completion = await profileService.getProfileCompletion()
                if (shouldShowPostApplySkillsNudge(completion)) setShowSkillsNudge(true)
              } catch {
                // Skip the nudge when profile completion cannot be read.
              }
            })()
          }}
          onCampusDriveInterestSubmitted={(status) => {
            if (!applyJob || !status) return
            patchJob(applyJob.id, { campus_drive_request_status: status })
            setShowQuickApplyModal(false)
            setApplyJob(null)
          }}
        />
      )}

      <PostQuickApplySkillsNudgeDialog isOpen={showSkillsNudge} onClose={() => setShowSkillsNudge(false)} />

      <CampusDriveInterestModal
        isOpen={showCampusDriveInterestModal}
        onClose={() => {
          if (interestSubmitting) return
          setShowCampusDriveInterestModal(false)
        }}
        onStillInterested={handleCampusDriveStillInterested}
        isSubmitting={interestSubmitting}
        message={getJobInterestModalCopy(interestModalKind).message}
        confirmLabel={getJobInterestModalCopy(interestModalKind).confirmLabel}
        title={getJobInterestModalCopy(interestModalKind).title}
      />
    </section>
  )
}
