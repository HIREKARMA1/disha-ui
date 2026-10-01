'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { CampusDriveDetailView } from '@/components/campus-drives/CampusDriveDetailView'
import { campusDriveService } from '@/services/campusDriveService'
import type { CampusDriveDetail } from '@/types/campusDrive'
import { Button } from '@/components/ui/button'

export default function AdminCampusDriveViewPage({ params }: { params: { id: string } }) {
  const [drive, setDrive] = useState<CampusDriveDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    campusDriveService
      .getAdmin(params.id)
      .then(setDrive)
      .catch(() => setDrive(null))
      .finally(() => setLoading(false))
  }, [params.id])

  return (
    <AdminDashboardLayout>
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/dashboard/admin/campus-drives"><Button variant="outline" size="sm">Back</Button></Link>
        <Link href={`/dashboard/admin/campus-drives/${params.id}/edit`}><Button size="sm">Edit</Button></Link>
        {drive?.publication_status === 'published' && drive.slug && (
          <Link href={`/campus-drives/${drive.slug}`}><Button variant="outline" size="sm">Public page</Button></Link>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : drive ? (
        <CampusDriveDetailView drive={drive} />
      ) : (
        <p className="text-sm text-gray-500">Campus Drive not found.</p>
      )}
    </AdminDashboardLayout>
  )
}
