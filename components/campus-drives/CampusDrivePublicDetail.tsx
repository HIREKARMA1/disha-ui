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
  buildCampusDriveRegisterRedirect,
  clearPendingCampusDriveRegistration,
  peekPendingCampusDriveRegistration,
  storePendingCampusDriveRegistration,
} from '@/lib/pendingCampusDriveRegistration'

export function CampusDrivePublicDetail({ slug }: { slug: string }) {
  const [drive, setDrive] = useState<CampusDriveDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [registering, setRegistering] = useState(false)
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

  const handleRegister = useCallback(async () => {
    if (!drive) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      const redirectPath = buildCampusDriveRegisterRedirect(slug, drive.id)
      storePendingCampusDriveRegistration(slug, drive.id)
      localStorage.setItem('redirect_after_login', redirectPath)
      openLoginModal({
        redirect: redirectPath,
        preferredType: 'student',
      })
      return
    }
    if (user && user.user_type && user.user_type !== 'student') {
      toast.error('Only student accounts can register for campus drives.')
      return
    }
    if (drive.is_registered) {
      clearPendingCampusDriveRegistration()
      toast.success('You are already registered for this campus drive.')
      return
    }
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
        const redirectPath = buildCampusDriveRegisterRedirect(slug, drive.id)
        storePendingCampusDriveRegistration(slug, drive.id)
        localStorage.setItem('redirect_after_login', redirectPath)
        openLoginModal({
          redirect: redirectPath,
          preferredType: 'student',
        })
        return
      }
      toast.error(msg)
    } finally {
      setRegistering(false)
    }
  }, [drive, slug, user, openLoginModal])

  useEffect(() => {
    if (!drive || authLoading || registering || autoRegisterAttempted.current) return
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const pending = peekPendingCampusDriveRegistration()
    const wantsRegister =
      (params.get('register') === '1' &&
        (params.get('action') === 'register' || !params.get('action'))) ||
      (pending?.slug === slug && pending.action === 'register')

    if (!wantsRegister) return
    if (drive.is_registered) {
      clearPendingCampusDriveRegistration()
      autoRegisterAttempted.current = true
      return
    }
    if (!isAuthenticated) return

    autoRegisterAttempted.current = true
    void handleRegister()
  }, [drive, authLoading, registering, slug, isAuthenticated, handleRegister])

  const registerState: CampusDriveRegisterState | undefined = drive
    ? {
        isRegistered: Boolean(drive.is_registered),
        registering,
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
