"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Download, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { contestEventService } from '@/services/contestEventService'
import type { EventRegistrationItem } from '@/types/contestEvent'
import { toast } from 'react-hot-toast'

interface EventRegistrationsProps {
  eventId: string
}

export function EventRegistrations({ eventId }: EventRegistrationsProps) {
  const [registrations, setRegistrations] = useState<EventRegistrationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchRegs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await contestEventService.getRegistrations(eventId, search || undefined)
      setRegistrations(data)
    } catch {
      toast.error('Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }, [eventId, search])

  useEffect(() => {
    const t = setTimeout(fetchRegs, 300)
    return () => clearTimeout(t)
  }, [fetchRegs])

  const updateStatus = async (regId: string, status: string) => {
    setActionLoading(regId)
    try {
      await contestEventService.updateRegistrationStatus(eventId, regId, status)
      toast.success(`Registration ${status}`)
      fetchRegs()
    } catch {
      toast.error('Failed to update registration')
    } finally {
      setActionLoading(null)
    }
  }

  const download = async (format: 'csv' | 'excel') => {
    try {
      const blob = format === 'csv'
        ? await contestEventService.exportRegistrations(eventId)
        : await contestEventService.exportRegistrationsExcel(eventId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registrations-${eventId}.${format === 'csv' ? 'csv' : 'xlsx'}`
      a.click()
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/events">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registrations</h1>
            <p className="text-sm text-gray-500">{registrations.length} participants</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => download('csv')}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => download('excel')}>
            <Download className="w-4 h-4 mr-1" /> Excel
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search by name, email, university..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">University</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Branch</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{reg.student_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{reg.email || '-'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{reg.university_name || '-'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{reg.branch || '-'}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{reg.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {reg.status === 'registered' && (
                        <>
                          <Button variant="ghost" size="sm" disabled={actionLoading === reg.id}
                            onClick={() => updateStatus(reg.id, 'selected')} title="Approve">
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled={actionLoading === reg.id}
                            onClick={() => updateStatus(reg.id, 'rejected')} title="Reject">
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {registrations.length === 0 && (
            <p className="text-center py-12 text-gray-500">No registrations found.</p>
          )}
        </div>
      )}
    </div>
  )
}
