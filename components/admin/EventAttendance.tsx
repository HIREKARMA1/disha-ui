"use client"

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Search, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { contestEventService } from '@/services/contestEventService'
import type { EventAttendanceItem, EventAttendanceListResponse } from '@/types/contestEvent'

interface EventAttendanceProps {
  eventId: string
}

function formatDateTime(value?: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

function statusLabel(status: string) {
  if (status === 'join_link_opened') return 'Join Link Opened'
  return status.replace(/_/g, ' ')
}

export function EventAttendance({ eventId }: EventAttendanceProps) {
  const [data, setData] = useState<EventAttendanceListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await contestEventService.getAttendance(eventId, {
        search: search.trim() || undefined,
        page,
        limit: 25,
      })
      setData(result)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [eventId, search, page])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary-600" />
            Attendance
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {data?.note ||
              'Shows candidates who opened the Join Meeting link. This is not verified Meet/Teams attendance.'}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No join-link opens recorded yet.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Phone</th>
                    <th className="px-3 py-2 font-medium">User Type</th>
                    <th className="px-3 py-2 font-medium">Registered At</th>
                    <th className="px-3 py-2 font-medium">Joined At</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((row: EventAttendanceItem) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2.5 font-medium">{row.full_name || '—'}</td>
                      <td className="px-3 py-2.5">{row.email || '—'}</td>
                      <td className="px-3 py-2.5">{row.phone || '—'}</td>
                      <td className="px-3 py-2.5 capitalize">{row.user_type || '—'}</td>
                      <td className="px-3 py-2.5">{formatDateTime(row.registered_at)}</td>
                      <td className="px-3 py-2.5">{formatDateTime(row.joined_at)}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300">
                          {statusLabel(row.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {data.total} total · Page {data.page} of {data.total_pages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.has_prev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.has_next}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
