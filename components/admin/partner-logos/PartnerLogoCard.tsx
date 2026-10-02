'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  CheckCircle,
  Clock,
  EyeOff,
  Mail,
  MoreVertical,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PartnerBrandingAdminItem, PartnerBrandingListingStatus } from '@/services/partnerBrandingService'

const LISTING_LABEL: Record<PartnerBrandingListingStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  hidden: 'Hide',
}

const LISTING_BADGE: Record<PartnerBrandingListingStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  hidden: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
}

type Props = {
  item: PartnerBrandingAdminItem
  variant: 'queue' | 'approved' | 'rejected'
  onReview?: () => void
  onSetListingStatus?: (status: PartnerBrandingListingStatus) => void
  onApprove?: () => void
  onDelete?: () => void
  busy?: boolean
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Updated today'
  if (days === 1) return 'Updated yesterday'
  if (days < 14) return `Updated ${days}d ago`
  return d.toLocaleDateString()
}

export function PartnerLogoCard({
  item,
  variant,
  onReview,
  onSetListingStatus,
  onApprove,
  onDelete,
  busy,
}: Props) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const listing = item.status === 'approved' ? item.listing_status : null
  const isHidden = listing === 'hidden'
  const isInactive = listing === 'inactive'
  const showMenu = variant === 'approved' || variant === 'rejected'

  useEffect(() => {
    if (!showDropdown) return
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [showDropdown])

  const closeAnd = (fn?: () => void) => {
    setShowDropdown(false)
    fn?.()
  }

  return (
    <article
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-[#0D1628]',
        isHidden && 'border-amber-200/80 dark:border-amber-800/50',
        isInactive && 'border-slate-200 dark:border-slate-700',
        !isHidden && !isInactive && 'border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'flex h-36 items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6 dark:from-gray-900 dark:to-[#0D1628]',
            (isHidden || isInactive) && 'opacity-75'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.proposed_logo_url}
            alt={item.company_name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        {(isHidden || isInactive) && (
          <div className="pointer-events-none absolute inset-0 bg-gray-900/10 dark:bg-black/25" />
        )}
        {variant === 'queue' && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/50 dark:text-amber-100">
            Pending review
          </span>
        )}
        {variant === 'rejected' && (
          <span className="absolute left-3 top-3 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-200">
            Rejected
          </span>
        )}
        {listing && (
          <span
            className={cn(
              'absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm',
              LISTING_BADGE[listing]
            )}
          >
            {listing === 'hidden' && <EyeOff className="h-3 w-3" />}
            {LISTING_LABEL[listing]}
          </span>
        )}

        {showMenu && (
          <div className="absolute right-2 top-2 z-10" ref={dropdownRef}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => setShowDropdown((v) => !v)}
              className="h-8 w-8 bg-white/90 p-0 shadow-sm hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showDropdown && (
              <div className="absolute right-0 top-9 z-50 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {variant === 'approved' && onSetListingStatus && (
                  <>
                    {listing !== 'active' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => closeAnd(() => onSetListingStatus('active'))}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                      >
                        <ToggleRight className="h-4 w-4" />
                        Set to Active
                      </button>
                    )}
                    {listing !== 'inactive' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => closeAnd(() => onSetListingStatus('inactive'))}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                      >
                        <ToggleLeft className="h-4 w-4" />
                        Set to Inactive
                      </button>
                    )}
                    {listing !== 'hidden' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => closeAnd(() => onSetListingStatus('hidden'))}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                      >
                        <EyeOff className="h-4 w-4" />
                        Set to Hide
                      </button>
                    )}
                  </>
                )}
                {variant === 'rejected' && onApprove && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => closeAnd(onApprove)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                )}
                {onDelete && (
                  <>
                    <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => closeAnd(onDelete)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete logo
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="rounded-lg bg-gray-50/90 px-3 py-2.5 dark:bg-white/[0.04]">
          <div className="flex gap-3">
            <div className="flex w-5 shrink-0 flex-col items-center gap-2.5 pt-0.5 text-gray-400">
              <Building2 className="h-4 w-4" aria-hidden />
              {item.corporate_email && <Mail className="h-3.5 w-3.5" aria-hidden />}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate font-semibold text-gray-900 dark:text-white">{item.company_name}</p>
                {item.corporate_verified && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle className="h-3 w-3" aria-hidden />
                    Verified
                  </span>
                )}
              </div>
              {item.corporate_email && (
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{item.corporate_email}</p>
              )}
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 border-t border-gray-200/80 pt-2 text-xs text-gray-500 dark:border-gray-700/80 dark:text-gray-400">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{formatRelative(item.updated_at)}</span>
          </div>
        </div>

        {isHidden && (
          <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            Hidden from homepage partner strip. Use the menu to set Active again.
          </p>
        )}

        {variant === 'rejected' && item.rejection_reason && (
          <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400" title={item.rejection_reason}>
            {item.rejection_reason}
          </p>
        )}

        {variant === 'queue' && onReview && (
          <button
            type="button"
            disabled={busy}
            onClick={onReview}
            className="mt-auto rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Review
          </button>
        )}
      </div>
    </article>
  )
}
