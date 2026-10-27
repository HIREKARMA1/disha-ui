'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'
import {
  CampusDriveDetailView,
  type CampusDriveRegisterState,
} from '@/components/campus-drives/CampusDriveDetailView'
import { campusDriveService, apiErrorMessage } from '@/services/campusDriveService'
import type { CampusDriveDetail } from '@/types/campusDrive'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import {
  buildSafeCampusDriveRegisterRedirect,
  clearPendingCampusDriveRegistration,
  peekPendingCampusDriveRegistration,
  storePendingCampusDriveRegistration,
} from '@/lib/pendingCampusDriveRegistration'

export function CampusDrivePublicDetail({ slug }: { slug: string }) {
  const [drive, setDrive] = useState<CampusDriveDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [resumeRequired, setResumeRequired] = useState(false)
  const autoRegisterAttempted = useRef(false)
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { openLoginModal } = useAuthLoginModal()

  const loadDrive = useCallback(async () => {
    setLoading(true)
    setMissing(false)
    try {
      const data = await campusDriveService.getPublic(slug)
      setDrive(data)
    } catch {
      setMissing(true)
      setDrive(null)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void loadDrive()
  }, [loadDrive])

  const showRegisterAction =
    Boolean(drive) &&
    (drive?.listing_status ?? 'active') !== 'hidden' &&
    Boolean(drive?.registration_is_open)

  const promptLogin = useCallback(() => {
    if (!drive) return
    const redirectPath = buildSafeCampusDriveRegisterRedirect(slug, drive.id)
    if (!redirectPath) return
    autoRegisterAttempted.current = false
    storePendingCampusDriveRegistration(slug, drive.id)
    openLoginModal({
      redirect: redirectPath,
      preferredType: 'student',
    })
  }, [drive, openLoginModal, slug])

  const handleRegister = useCallback(async () => {
    if (!drive) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      promptLogin()
      return
    }
    if (user && user.user_type && user.user_type !== 'student') {
      clearPendingCampusDriveRegistration()
      toast.error('Only student accounts can register for campus drives.')
      return
    }
    if (drive.is_registered) {
      clearPendingCampusDriveRegistration()
      toast.success('You are already registered for this campus drive.')
      return
    }
    setResumeRequired(false)
    setRegistering(true)
    try {
      await campusDriveService.registerForCampusDrive(slug)
      clearPendingCampusDriveRegistration()
      toast.success('Successfully registered for the campus drive!')
      setDrive((prev) => (prev ? { ...prev, is_registered: true } : prev))
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('register')
        url.searchParams.delete('action')
        url.searchParams.delete('driveId')
        window.history.replaceState(
          window.history.state,
          '',
          url.pathname + url.search + (url.hash || ''),
        )
      }
      try {
        const updated = await campusDriveService.getPublic(slug)
        setDrive({ ...updated, is_registered: true })
      } catch {
        // keep optimistic state
      }
    } catch (err: unknown) {
      const msg = apiErrorMessage(err, 'Registration failed')
      const status = (err as { response?: { status?: number } })?.response?.status
      if (
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('already registered') || status === 409)
      ) {
        clearPendingCampusDriveRegistration()
        toast.success('You are already registered for this campus drive.')
        setDrive((prev) => (prev ? { ...prev, is_registered: true } : prev))
        return
      }
      if (status === 401) {
        promptLogin()
        return
      }
      if (typeof msg === 'string' && msg.toLowerCase().includes('resume is required')) {
        setResumeRequired(true)
        toast.error('Add a resume to your profile before registering.')
        return
      }
      clearPendingCampusDriveRegistration()
      toast.error(msg)
    } finally {
      setRegistering(false)
    }
  }, [drive, promptLogin, slug, user])

  useEffect(() => {
    if (!drive || authLoading || registering || autoRegisterAttempted.current) return
    if (!isAuthenticated || typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const urlDriveId = params.get('driveId')
    const urlWantsRegister =
      params.get('register') === '1' &&
      (params.get('action') === 'register' || !params.get('action')) &&
      (!urlDriveId || urlDriveId === drive.id)

    const pending = peekPendingCampusDriveRegistration()
    const pendingMatchesDrive =
      pending?.action === 'register' &&
      pending.slug === slug &&
      (!pending.driveId || pending.driveId === drive.id)

    // The login return URL carries the register action. A leftover pending record
    // without that URL must not register the student on a later visit.
    if (!urlWantsRegister) {
      if (pendingMatchesDrive) clearPendingCampusDriveRegistration()
      return
    }

    autoRegisterAttempted.current = true
    clearPendingCampusDriveRegistration()
    const url = new URL(window.location.href)
    if (url.searchParams.has('register') || url.searchParams.has('action') || url.searchParams.has('driveId')) {
      url.searchParams.delete('register')
      url.searchParams.delete('action')
      url.searchParams.delete('driveId')
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }

    if (drive.is_registered) {
      toast.success('You are already registered for this campus drive.')
      return
    }

    void handleRegister()
  }, [drive, authLoading, registering, isAuthenticated, handleRegister, slug])

  const resumeReturn = drive
    ? `/campus-drives/${encodeURIComponent(slug)}?register=1&action=register&driveId=${encodeURIComponent(drive.id)}`
    : ''
  const registerState: CampusDriveRegisterState | undefined = drive
    ? {
        isRegistered: Boolean(drive.is_registered),
        registering,
        resumeRequired,
        resumeHref: resumeReturn ? `/dashboard/student/profile?resume_return=${encodeURIComponent(resumeReturn)}` : undefined,
        onRegister: () => void handleRegister(),
        showRegisterAction,
      }
    : undefined

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-gray-50 dark:bg-gray-900">
      <DishaTopBar showSearch={false} />
      <main className="min-w-0 flex-1">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : missing || !drive ? (
          <div className="mx-auto max-w-lg px-4 py-24 text-center">
            <h1 className="text-xl font-semibold">Campus Drive not available</h1>
            <p className="mt-2 text-sm text-gray-500">
              It may be unpublished or hidden for your account.
            </p>
            <Link href="/campus-drives" className="mt-4 inline-block text-primary-600 underline">
              Back to campus drives
            </Link>
          </div>
        ) : (
          <CampusDriveDetailView drive={drive} wide registerState={registerState} />
        )}
      </main>
      <Footer />
    </div>
  )
}
