'use client'

import { Building2, Eye, MapPin, Undo2, IndianRupee } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ApplicationCardData {
  id: string
  job_title?: string
  corporate_name?: string
  status: string
  applied_at: string
  location?: string
  salary?: string
  job_type?: string
  offer_letter_url?: string
}

interface ApplicationCardProps {
  application: ApplicationCardData
  onView?: () => void
  onWithdraw?: () => void
  className?: string
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function ApplicationCard({ application, onView, onWithdraw, className }: ApplicationCardProps) {
  const company = application.corporate_name || 'Company'
  const initial = company.charAt(0).toUpperCase()
  const canWithdraw =
    onWithdraw && ['applied', 'pending', 'shortlisted'].includes((application.status || '').toLowerCase())

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200/80 dark:border-gray-700/70 bg-white dark:bg-gray-800/90 p-3 shadow-sm',
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                {application.job_title || 'Untitled Role'}
              </h3>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 flex items-center gap-1 truncate">
                <Building2 className="w-3 h-3 shrink-0" />
                {company}
              </p>
            </div>
            <StatusBadge status={application.status} className="shrink-0" />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {application.job_type && (
              <span className="inline-flex items-center rounded-md bg-sky-50 dark:bg-sky-900/30 border border-sky-200/70 dark:border-sky-700/50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                {application.job_type}
              </span>
            )}
            {application.location && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                <MapPin className="w-2.5 h-2.5" />
                {application.location}
              </span>
            )}
            {application.salary && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                <IndianRupee className="w-2.5 h-2.5" />
                {application.salary}
              </span>
            )}
          </div>

          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            Applied {formatDate(application.applied_at)}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex gap-1.5">
        {onView && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1 h-8 rounded-lg text-[11px] font-semibold px-2"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
        )}
        {canWithdraw && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onWithdraw}
            className="flex-1 h-8 rounded-lg text-[11px] font-semibold px-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Undo2 className="w-3 h-3 mr-1" />
            Withdraw
          </Button>
        )}
      </div>
    </div>
  )
}
