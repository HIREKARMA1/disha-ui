'use client'

import { useEffect, useState } from 'react'
import { Briefcase, CheckCircle2, Eye, FileText, Loader2, MapPin, Trash2, X, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import { GoogleLocationAutocomplete } from '@/components/ui/GoogleLocationAutocomplete'
import { profileService, type StudentProfile } from '@/services/profileService'
import { apiClient } from '@/lib/api'
import { clearPendingJobApplication } from '@/lib/pendingJobApplication'
import {
  APPLY_SUCCESS_MESSAGE,
  defaultApplyPayload,
  toastApplyError,
} from '@/lib/jobApplicationMessages'
import { extractErrorDetail } from '@/lib/profileCompletion'
import { cn } from '@/lib/utils'

export interface QuickApplyJobInfo {
  id: string
  title: string
  company_name?: string
  corporate_name?: string
  company_logo?: string
  location?: string | string[]
  job_type?: string
}

interface QuickApplyModalProps {
  job: QuickApplyJobInfo
  onClose: () => void
  onSuccess: () => void
  /** @deprecated Always opens as LinkedIn-style centered modal */
  variant?: 'modal' | 'panel'
}

type StepId = 0 | 1

type ResumeFileItem = {
  id: string
  file_url: string
  file_name?: string | null
  is_selected: boolean
  created_at?: string | null
}

function formatLocation(location?: string | string[]): string {
  if (!location) return 'Location not specified'
  return Array.isArray(location) ? location.filter(Boolean).join(', ') : location
}

function isBlank(value?: string | null): boolean {
  return !value || !String(value).trim()
}

export function QuickApplyModal({ job, onClose, onSuccess }: QuickApplyModalProps) {
  const [step, setStep] = useState<StepId>(0)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)

  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profilePhone, setProfilePhone] = useState('')

  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [resumeFiles, setResumeFiles] = useState<ResumeFileItem[]>([])
  const [maxResumes, setMaxResumes] = useState(5)

  /** After first application, DOB/gender/location are always read-only. */
  const [hasAppliedBefore, setHasAppliedBefore] = useState(false)
  /** Fields already present on profile stay read-only even on first apply. */
  const [dobLockedFromProfile, setDobLockedFromProfile] = useState(false)
  const [genderLockedFromProfile, setGenderLockedFromProfile] = useState(false)
  const [locationLockedFromProfile, setLocationLockedFromProfile] = useState(false)

  const [locationError, setLocationError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const canEditDob = !hasAppliedBefore && !dobLockedFromProfile
  const canEditGender = !hasAppliedBefore && !genderLockedFromProfile
  const canEditLocation = !hasAppliedBefore && !locationLockedFromProfile
  const anyBasicsEditable = canEditDob || canEditGender || canEditLocation

  const applyResumeLibrary = (data: {
    resumes: ResumeFileItem[]
    max_resumes?: number
    selected_resume_url?: string | null
  }) => {
    setResumeFiles(data.resumes || [])
    if (typeof data.max_resumes === 'number') setMaxResumes(data.max_resumes)
    const selected =
      data.selected_resume_url ||
      data.resumes?.find((r) => r.is_selected)?.file_url ||
      null
    setResumeUrl(selected)
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoadingProfile(true)
        const [profile, appsResponse, resumeLibrary] = await Promise.all([
          profileService.getProfile(),
          apiClient.getStudentApplications({ page: 1, limit: 1 }).catch(() => null),
          profileService.listResumeFiles().catch(() => null),
        ])
        if (cancelled) return

        const appCount =
          Number((appsResponse as { total_count?: number } | null)?.total_count || 0) ||
          ((appsResponse as { applications?: unknown[] } | null)?.applications || []).length
        setHasAppliedBefore(appCount > 0)

        setProfileName(profile.name || '')
        setProfileEmail(profile.email || '')
        setProfilePhone(profile.phone || '')

        const nextDob = profile.dob ? String(profile.dob).slice(0, 10) : ''
        const nextGender = profile.gender || ''
        const nextCity = profile.city || ''
        const nextState = profile.state || ''
        const nextCountry = profile.country || ''

        setDob(nextDob)
        setGender(nextGender)
        setCity(nextCity)
        setState(nextState)
        setCountry(nextCountry)

        setDobLockedFromProfile(!isBlank(nextDob))
        setGenderLockedFromProfile(!isBlank(nextGender))
        setLocationLockedFromProfile(
          !(isBlank(nextCity) && isBlank(nextState) && isBlank(nextCountry))
        )

        if (resumeLibrary) {
          applyResumeLibrary(resumeLibrary)
        } else {
          setResumeUrl(profile.resume || null)
        }
      } catch {
        if (!cancelled) {
          toast.error('Could not load your profile. Please try again.')
        }
      } finally {
        if (!cancelled) setLoadingProfile(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const stepLabels = ['Contact info', 'Resume'] as const
  const currentStepLabel = stepLabels[step]
  // Progress follows current step (not pre-filled profile completeness)
  const progressPercent = Math.round(((step + 1) / stepLabels.length) * 100)

  const validateBasics = (): boolean => {
    const next: Record<string, string> = {}
    const profileHint = 'Add your date of birth in Profile → Basic Info'
    if (isBlank(dob)) {
      next.dob = canEditDob ? 'Date of birth is required' : profileHint
    } else {
      const dobDate = new Date(dob)
      const today = new Date()
      const minDate = new Date()
      minDate.setFullYear(today.getFullYear() - 100)
      const maxDate = new Date()
      maxDate.setFullYear(today.getFullYear() - 16)
      if (Number.isNaN(dobDate.getTime())) {
        next.dob = canEditDob
          ? 'Enter a valid date of birth'
          : 'Enter a valid date of birth in your profile'
      } else if (dobDate > today) next.dob = 'Date of birth cannot be in the future'
      else if (dobDate < minDate) {
        next.dob = canEditDob
          ? 'Please enter a valid date of birth'
          : 'Please enter a valid date of birth in your profile'
      } else if (dobDate > maxDate) next.dob = 'You must be at least 16 years old'
    }
    if (isBlank(gender)) {
      next.gender = canEditGender
        ? 'Gender is required'
        : 'Add your gender in Profile → Basic Info'
    }
    if (isBlank(city) && isBlank(state) && isBlank(country)) {
      const locMsg = canEditLocation
        ? 'Location is required'
        : 'Add your location in Profile → Basic Info'
      next.location = locMsg
      setLocationError(locMsg)
    } else {
      setLocationError('')
    }
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const validateResume = (): boolean => {
    if (isBlank(resumeUrl)) {
      setFieldErrors({ resume: 'Resume is required' })
      return false
    }
    setFieldErrors({})
    return true
  }

  const handleResumeSelect = async (file: File) => {
    try {
      setUploadingResume(true)
      setFieldErrors((prev) => ({ ...prev, resume: '' }))
      if (resumeFiles.length >= maxResumes) {
        throw new Error(
          `You can store up to ${maxResumes} resumes. Delete one to upload another.`
        )
      }
      await profileService.uploadResume(file)
      const library = await profileService.listResumeFiles()
      applyResumeLibrary(library)
      toast.success('Resume uploaded')
    } catch (error: unknown) {
      const fromApi = extractErrorDetail(error)
      const message =
        (fromApi && fromApi !== '[object Object]' ? fromApi : null) ||
        (error instanceof Error && error.message !== '[object Object]'
          ? error.message
          : null) ||
        'Failed to upload resume. Use a PDF under 5 MB.'
      toast.error(message)
      setFieldErrors((prev) => ({ ...prev, resume: message }))
    } finally {
      setUploadingResume(false)
    }
  }

  const handleSelectResume = async (resumeFileId: string) => {
    try {
      const library = await profileService.selectResumeFile(resumeFileId)
      applyResumeLibrary(library)
      setFieldErrors((prev) => ({ ...prev, resume: '' }))
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to select resume'
      )
    }
  }

  const handleDeleteResume = async (resumeFileId: string) => {
    try {
      const library = await profileService.deleteResumeFile(resumeFileId)
      applyResumeLibrary(library)
      if (!(library.resumes || []).length) {
        setFieldErrors((prev) => ({
          ...prev,
          resume: 'Resume is required',
        }))
      }
      toast.success('Resume removed')
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete resume'
      )
    }
  }

  const goNext = () => {
    if (step === 0) {
      if (!validateBasics()) {
        toast.error('Please fill required contact details')
        return
      }
      setStep(1)
    }
  }

  const goBack = () => {
    if (step === 0) return
    setStep(0)
    setFieldErrors({})
  }

  const handleSubmit = async () => {
    if (!validateBasics() || !validateResume()) {
      toast.error('Please complete required fields')
      return
    }

    try {
      setSubmitting(true)
      await profileService.updateProfile({
        dob,
        gender,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
      })

      await apiClient.applyForJob(job.id, defaultApplyPayload(job.id))
      clearPendingJobApplication()
      toast.success(APPLY_SUCCESS_MESSAGE)
      onSuccess()
    } catch (error: unknown) {
      toastApplyError(error)
    } finally {
      setSubmitting(false)
    }
  }

  const companyLabel = job.company_name || job.corporate_name || 'Company'
  const locationDisplay =
    [city, state, country].filter(Boolean).join(', ') || city

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" role="presentation">
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          className="fixed inset-0 bg-gray-900/55 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-apply-title"
          className="relative flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#151b2b] sm:rounded-2xl"
        >
          {/* Header */}
          <div className="shrink-0 border-b border-gray-100 px-4 pb-3 pt-4 dark:border-white/10 sm:px-5">
            <div className="flex items-start gap-3">
              <CompanyLogo
                logoUrl={job.company_logo}
                companyName={companyLabel}
                size="md"
                className="shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <h2
                  id="quick-apply-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Apply to {companyLabel}
                </h2>
                <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-300">
                  {job.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {formatLocation(job.location)}
                  </span>
                  {job.job_type && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.job_type}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress — bar + % only (step title shown in body) */}
            <div className="mt-4 flex items-center gap-3">
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-600 dark:text-gray-300">
                {progressPercent}%
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Step {step + 1} of {stepLabels.length} · {currentStepLabel}
            </p>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            {loadingProfile ? (
              <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading your details…
              </div>
            ) : (
              <>
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Contact info
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Confirm your details. Fields already on your profile are filled in — complete
                        any required blanks.
                      </p>
                    </div>

                    {/* Profile snapshot (prefilled context) */}
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {(profileName || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {profileName || 'Student'}
                        </p>
                      </div>
                    </div>

                    {profileEmail && (
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileEmail}
                          readOnly
                          className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                        />
                      </div>
                    )}

                    {profilePhone && (
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Mobile phone
                        </label>
                        <input
                          type="tel"
                          value={profilePhone}
                          readOnly
                          className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                        />
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {anyBasicsEditable ? (
                        <>
                          Fill any missing details below. Values already on your profile stay locked —
                          edit those in{' '}
                          <span className="font-medium text-gray-700 dark:text-gray-200">
                            Profile → Basic Info
                          </span>
                          .
                        </>
                      ) : (
                        <>
                          Date of birth, gender, and location come from your profile. To change them,
                          edit{' '}
                          <span className="font-medium text-gray-700 dark:text-gray-200">
                            Profile → Basic Info
                          </span>
                          .
                        </>
                      )}
                    </p>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      {canEditDob ? (
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => {
                            setDob(e.target.value)
                            setFieldErrors((prev) => ({ ...prev, dob: '' }))
                          }}
                          className={cn(
                            'w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-white',
                            fieldErrors.dob
                              ? 'border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          )}
                        />
                      ) : (
                        <input
                          type="text"
                          value={
                            dob
                              ? new Date(dob + 'T00:00:00').toLocaleDateString(undefined, {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : ''
                          }
                          readOnly
                          placeholder="Not set in profile"
                          className={cn(
                            'w-full cursor-not-allowed rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300',
                            fieldErrors.dob
                              ? 'border-red-500'
                              : 'border-gray-200 dark:border-white/10'
                          )}
                        />
                      )}
                      {fieldErrors.dob && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.dob}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      {canEditGender ? (
                        <select
                          value={gender}
                          onChange={(e) => {
                            setGender(e.target.value)
                            setFieldErrors((prev) => ({ ...prev, gender: '' }))
                          }}
                          className={cn(
                            'w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-white',
                            fieldErrors.gender
                              ? 'border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          )}
                        >
                          <option value="">Select your gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={
                            gender
                              ? gender.charAt(0).toUpperCase() + gender.slice(1)
                              : ''
                          }
                          readOnly
                          placeholder="Not set in profile"
                          className={cn(
                            'w-full cursor-not-allowed rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300',
                            fieldErrors.gender
                              ? 'border-red-500'
                              : 'border-gray-200 dark:border-white/10'
                          )}
                        />
                      )}
                      {fieldErrors.gender && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.gender}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Location (city) <span className="text-red-500">*</span>
                      </label>
                      {canEditLocation ? (
                        <GoogleLocationAutocomplete
                          value={
                            locationDisplay ||
                            [city, state, country].filter(Boolean).join(', ')
                          }
                          placeholder="City, town, or locality"
                          mode="all"
                          error={locationError || fieldErrors.location}
                          onChange={(place) => {
                            setLocationError('')
                            setFieldErrors((prev) => ({ ...prev, location: '' }))
                            setCity(place.city || place.formattedAddress || '')
                            setState(place.state || '')
                            setCountry(place.country || '')
                          }}
                        />
                      ) : (
                        <>
                          <input
                            type="text"
                            value={
                              locationDisplay ||
                              [city, state, country].filter(Boolean).join(', ')
                            }
                            readOnly
                            placeholder="Not set in profile"
                            className={cn(
                              'w-full cursor-not-allowed rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300',
                              locationError || fieldErrors.location
                                ? 'border-red-500'
                                : 'border-gray-200 dark:border-white/10'
                            )}
                          />
                          {(locationError || fieldErrors.location) && (
                            <p className="mt-1 text-xs text-red-500">
                              {locationError || fieldErrors.location}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="w-full space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Resume
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Select one resume for this application. You can store up to{' '}
                        {maxResumes} PDFs. <span className="text-red-500">*</span>
                      </p>
                    </div>

                    <div className="box-border w-full space-y-3">
                      {resumeFiles.map((item, index) => {
                        const label =
                          item.file_name?.trim() || `Resume ${index + 1}`
                        const selected = item.is_selected
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              'box-border flex w-full min-h-[4.5rem] flex-col gap-3 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center',
                              selected
                                ? 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-800/50 dark:bg-emerald-950/30'
                                : 'border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]'
                            )}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <input
                                type="radio"
                                name="quick-apply-resume"
                                checked={selected}
                                onChange={() => void handleSelectResume(item.id)}
                                className="h-4 w-4 shrink-0 border-gray-300 text-blue-600"
                                aria-label={`Select ${label}`}
                              />
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-white/10">
                                <FileText className="h-5 w-5 text-red-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                  {label}
                                </p>
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                  {item.file_url}
                                </p>
                              </div>
                              {selected && (
                                <CheckCircle2 className="hidden h-5 w-5 shrink-0 text-emerald-500 sm:block" />
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5 pl-7 sm:pl-0">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                                onClick={() =>
                                  window.open(
                                    item.file_url,
                                    '_blank',
                                    'noopener,noreferrer'
                                  )
                                }
                              >
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                View
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 rounded-lg p-0 text-gray-500 hover:text-red-600"
                                onClick={() => void handleDeleteResume(item.id)}
                                aria-label={`Delete ${label}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {selected && (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 sm:hidden" />
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {resumeFiles.length < maxResumes ? (
                        <label
                          className={cn(
                            'box-border flex w-full min-h-[4.5rem] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-3 text-center transition-colors dark:border-white/15 dark:bg-white/[0.03]',
                            'hover:border-gray-400 hover:bg-gray-50/80 dark:hover:border-white/25 dark:hover:bg-white/[0.05]',
                            (uploadingResume || submitting) &&
                              'pointer-events-none opacity-50'
                          )}
                        >
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            disabled={uploadingResume || submitting}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              e.target.value = ''
                              if (file) void handleResumeSelect(file)
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 shrink-0 text-emerald-600" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Upload resume (PDF only, max 5 MB) ·{' '}
                              {resumeFiles.length}/{maxResumes}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Click to upload · PDF only up to 5 MB
                          </p>
                        </label>
                      ) : (
                        <p className="box-border w-full rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
                          Limit reached ({maxResumes}/{maxResumes}). Delete a resume to
                          upload another.
                        </p>
                      )}
                    </div>

                    {uploadingResume && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Uploading resume…
                      </p>
                    )}
                    {fieldErrors.resume && (
                      <p className="text-xs text-red-500">{fieldErrors.resume}</p>
                    )}
                  </div>
                )}

              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-gray-100 px-4 py-3 dark:border-white/10 sm:px-5">
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/40"
              onClick={step === 0 ? onClose : goBack}
              disabled={submitting}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>

            {step < 1 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={loadingProfile || uploadingResume}
                className="h-10 min-w-[100px] rounded-full bg-blue-600 px-6 font-semibold text-white hover:bg-blue-500"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={loadingProfile || submitting || uploadingResume}
                className="h-10 min-w-[140px] rounded-full bg-blue-600 px-6 font-semibold text-white hover:bg-blue-500"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
