'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'
import { CampusDriveDetailView } from '@/components/campus-drives/CampusDriveDetailView'
import { campusDriveService } from '@/services/campusDriveService'
import type { CampusDriveDetail } from '@/types/campusDrive'

export function CampusDrivePublicDetail({ slug }: { slug: string }) {
  const [drive, setDrive] = useState<CampusDriveDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    setLoading(true)
    campusDriveService
      .getPublic(slug)
      .then(setDrive)
      .catch(() => setMissing(true))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-gray-50 dark:bg-gray-900">
      <DishaTopBar showSearch={false} />
      <main className="min-w-0 flex-1">
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : missing || !drive ? (
          <div className="mx-auto max-w-lg px-4 py-24 text-center">
            <h1 className="text-xl font-semibold">Campus Drive not available</h1>
            <p className="mt-2 text-sm text-gray-500">It may be unpublished or hidden for your account.</p>
            <Link href="/campus-drives" className="mt-4 inline-block text-primary-600 underline">Back to campus drives</Link>
          </div>
        ) : (
          <CampusDriveDetailView drive={drive} />
        )}
      </main>
      <Footer />
    </div>
  )
}
