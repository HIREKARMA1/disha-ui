'use client'

import { Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CampusDriveAnalyticsUnsupportedAttendance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary-600" />
          Attendance
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Campus drives do not record join-link opens or verified session attendance.
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Event analytics uses <code className="text-xs">event_join_clicks</code> when students open a meeting link.
          Campus Drive programs link to jobs and optional external URLs but do not persist attendance events.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          The Registered Users table lists campus drive program registrations; job application status is tracked separately.
        </p>
      </CardContent>
    </Card>
  )
}
