'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Clock, CheckCircle, XCircle, Search, RefreshCw, ImageIcon, LayoutGrid } from 'lucide-react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import { adminCard } from '@/components/admin/ui/admin-theme'
import { cn } from '@/lib/utils'
import {
  partnerBrandingService,
  type PartnerBrandingAdminItem,
  type PartnerBrandingListingStatus,
  type PartnerBrandingStats,
} from '@/services/partnerBrandingService'
import { PartnerLogoReviewModal } from '@/components/admin/partner-logos/PartnerLogoReviewModal'
import { PartnerLogoCard } from '@/components/admin/partner-logos/PartnerLogoCard'
import { getErrorMessage } from '@/lib/error-handler'

type Tab = 'queue' | 'approved' | 'rejected'
type ListingFilter = 'all' | PartnerBrandingListingStatus

const EMPTY_STATS: PartnerBrandingStats = {
  pending: 0,
  rejected: 0,
  approved_total: 0,
  active: 0,
  inactive: 0,
  hidden: 0,
}

export default function AdminPartnerLogosPage() {
  const [tab, setTab] = useState<Tab>('queue')
  const [listingFilter, setListingFilter] = useState<ListingFilter>('all')
  const [items, setItems] = useState<PartnerBrandingAdminItem[]>([])
  const [stats, setStats] = useState<PartnerBrandingStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [actionBusy, setActionBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<PartnerBrandingAdminItem | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, listRes] = await Promise.all([
        partnerBrandingService.getStats(),
        partnerBrandingService.list({
          status: tab === 'queue' ? 'pending' : tab === 'rejected' ? 'rejected' : 'approved',
          listing_status:
            tab === 'approved' && listingFilter !== 'all' ? listingFilter : undefined,
          page_size: 100,
        }),
      ])
      setStats({ ...EMPTY_STATS, ...statsRes })
      setItems(listRes.items)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [tab, listingFilter])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (tab !== 'approved') setListingFilter('all')
  }, [tab])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.company_name.toLowerCase().includes(q) ||
        (i.corporate_email || '').toLowerCase().includes(q)
    )
  }, [items, search])

  const openReview = (item: PartnerBrandingAdminItem) => {
    setSelected(item)
    setReviewOpen(true)
  }

  const handleApprove = async (id: string) => {
    setActionBusy(true)
    try {
      await partnerBrandingService.approve(id)
      toast.success('Approved — logo is Active on the homepage strip')
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setActionBusy(false)
    }
  }

  const handleReject = async (id: string, reason: string) => {
    await partnerBrandingService.reject(id, reason)
    toast.success('Logo rejected')
    load()
  }

  const handleSetListing = async (item: PartnerBrandingAdminItem, listing_status: PartnerBrandingListingStatus) => {
    setActionBusy(true)
    try {
      await partnerBrandingService.setListingStatus(item.id, listing_status)
      const labels = { active: 'Active', inactive: 'Inactive', hidden: 'Hide' }
      toast.success(`Set to ${labels[listing_status]}`)
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setActionBusy(false)
    }
  }

  const handleDelete = async (item: PartnerBrandingAdminItem) => {
    const ok = window.confirm(
      `Delete the partner logo record for "${item.company_name}"? This cannot be undone. The corporate can submit a new logo later.`
    )
    if (!ok) return
    setActionBusy(true)
    try {
      await partnerBrandingService.delete(item.id)
      toast.success('Logo record deleted')
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setActionBusy(false)
    }
  }

  const cardVariant = tab === 'queue' ? 'queue' : tab === 'rejected' ? 'rejected' : 'approved'

  return (
    <AdminDashboardLayout>
      <div className="mx-auto max-w-[1600px] space-y-4 md:space-y-6">
        <AdminPageHero
          title="Partner logos"
          subtitle="Review corporate logos for the homepage partner strip. Use the menu on each card for status and delete actions."
          chips={[
            {
              label: `${stats.pending} Pending`,
              tone: 'orange',
              icon: <Clock className="h-3.5 w-3.5" />,
            },
            {
              label: `${stats.active} Active`,
              tone: 'green',
              icon: <CheckCircle className="h-3.5 w-3.5" />,
            },
            {
              label: `${stats.inactive + stats.hidden} Off strip`,
              tone: 'purple',
              icon: <LayoutGrid className="h-3.5 w-3.5" />,
            },
            {
              label: `${stats.rejected} Rejected`,
              tone: 'purple',
              icon: <XCircle className="h-3.5 w-3.5" />,
            },
          ]}
        />

        <div className={cn(adminCard, 'p-4 md:p-5')}>
          <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-2">
              <div className="flex space-x-1 self-start rounded-xl bg-gray-100 p-1 dark:bg-white/[0.06]">
                {(
                  [
                    ['queue', 'Review queue', stats.pending],
                    ['approved', 'Approved', stats.approved_total],
                    ['rejected', 'Rejected', stats.rejected],
                  ] as const
                ).map(([key, label, count]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      tab === key
                        ? 'bg-white text-blue-600 shadow-sm dark:bg-[#0D1628] dark:text-blue-400'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    )}
                  >
                    <ImageIcon className="h-4 w-4" />
                    {label}
                    {count > 0 && (
                      <span className="rounded-full bg-gray-200/80 px-1.5 py-0.5 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {tab === 'approved' && (
                <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 p-1 dark:border-gray-700">
                  {(
                    [
                      ['all', 'All', stats.approved_total],
                      ['active', 'Active', stats.active],
                      ['inactive', 'Inactive', stats.inactive],
                      ['hidden', 'Hide', stats.hidden],
                    ] as const
                  ).map(([key, label, count]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setListingFilter(key)}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                        listingFilter === key
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      {label}
                      <span className="ml-1 opacity-80">({count})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search company…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <button
                type="button"
                onClick={() => load()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-gray-500">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              {tab === 'queue'
                ? 'No logos waiting for review.'
                : tab === 'approved'
                  ? 'No approved logos match this filter.'
                  : 'No rejected logos.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => (
                <PartnerLogoCard
                  key={item.id}
                  item={item}
                  variant={cardVariant}
                  busy={actionBusy}
                  onReview={tab === 'queue' ? () => openReview(item) : undefined}
                  onSetListingStatus={
                    tab === 'approved'
                      ? (status) => handleSetListing(item, status)
                      : undefined
                  }
                  onApprove={tab === 'rejected' ? () => handleApprove(item.id) : undefined}
                  onDelete={
                    tab === 'approved' || tab === 'rejected'
                      ? () => handleDelete(item)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <PartnerLogoReviewModal
        item={selected}
        isOpen={reviewOpen}
        onClose={() => {
          setReviewOpen(false)
          setSelected(null)
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </AdminDashboardLayout>
  )
}
