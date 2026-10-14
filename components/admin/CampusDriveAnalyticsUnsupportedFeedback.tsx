'use client'

import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CampusDriveAnalyticsUnsupportedFeedback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-accent-yellow-500" />
          Feedback &amp; Ratings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Feedback and ratings are not tracked for Campus Drive programs. Contest events store student feedback in{' '}
          <code className="text-xs">event_feedback</code>; there is no equivalent table or API for campus drives.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          To enable this section, add a campus-drive feedback model and collection flow (similar to event feedback after
          completion).
        </p>
      </CardContent>
    </Card>
  )
}
