'use client'

import { Building2, Eye, MapPin, Undo2, IndianRupee } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ApplicationCardData {
  id: string
  job_title?: string
  corporate_name?: string
  company_logo?: string
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
        'rounded-lg border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#151b2b]/90 p-2 shadow-sm',
        className
      )}
    >
      <div className="flex items-start gap-2">
        {application.company_logo ? (
          <img
            src={application.company_logo}
            alt={company}
            className="w-8 h-8 rounded-md object-cover border border-gray-200 dark:border-white/10 bg-white shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 leading-snug">
                {application.job_title || 'Untitled Role'}
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                <Building2 className="w-2.5 h-2.5 shrink-0" />
                {company}
              </p>
            </div>
            <StatusBadge status={application.status} className="shrink-0 scale-90 origin-top-right" />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1">
            {application.job_type && (
              <span className="inline-flex items-center rounded bg-emerald-500/10 border border-emerald-500/20 px-1 py-0 text-[9px] font-semibold text-emerald-400">
                {application.job_type}
              </span>
            )}
            {application.location && (
              <span className="inline-flex items-center gap-0.5 text-[9px] text-gray-500">
                <MapPin className="w-2.5 h-2.5" />
                {application.location}
              </span>
            )}
            {application.salary && (
              <span className="inline-flex items-center gap-0.5 text-[9px] text-gray-500">
                <IndianRupee className="w-2.5 h-2.5" />
                {application.salary}
              </span>
            )}
          </div>

          <p className="text-[9px] text-gray-500 mt-0.5">Applied {formatDate(application.applied_at)}</p>
        </div>
      </div>

      <div className="mt-1.5 flex gap-1">
        {onView && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1 h-7 rounded-md text-[10px] font-semibold px-1.5 border-gray-200 dark:border-white/10"
          >
            <Eye className="w-3 h-3 mr-0.5" />
            View
          </Button>
        )}
        {canWithdraw && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onWithdraw}
            className="flex-1 h-7 rounded-md text-[10px] font-semibold px-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10"
          >
            <Undo2 className="w-3 h-3 mr-0.5" />
            Withdraw
          </Button>
        )}
      </div>
    </div>
  )
}
