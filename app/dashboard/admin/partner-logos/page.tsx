'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Clock, CheckCircle, XCircle, Search, RefreshCw, ImageIcon, Eye, EyeOff } from 'lucide-react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import { adminCard } from '@/components/admin/ui/admin-theme'
import { cn } from '@/lib/utils'
import {
  partnerBrandingService,
  type PartnerBrandingAdminItem,
  type PartnerBrandingStats,
} from '@/services/partnerBrandingService'
import { PartnerLogoReviewModal } from '@/components/admin/partner-logos/PartnerLogoReviewModal'
import { getErrorMessage } from '@/lib/error-handler'

type Tab = 'queue' | 'live' | 'rejected'

export default function AdminPartnerLogosPage() {
  const [tab, setTab] = useState<Tab>('queue')
  const [items, setItems] = useState<PartnerBrandingAdminItem[]>([])
  const [stats, setStats] = useState<PartnerBrandingStats>({
    pending: 0,
    approved_visible: 0,
    rejected: 0,
    approved_hidden: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<PartnerBrandingAdminItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, listRes] = await Promise.all([
        partnerBrandingService.getStats(),
        partnerBrandingService.list({
          status: tab === 'queue' ? 'pending' : tab === 'rejected' ? 'rejected' : 'approved',
          visible: tab === 'live' ? true : tab === 'queue' || tab === 'rejected' ? undefined : undefined,
          page_size: 100,
        }),
      ])
      setStats(statsRes)
      let list = listRes.items
      if (tab === 'live') {
        list = list.filter((i) => i.visible)
      }
      setItems(list)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

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
    setModalOpen(true)
  }

  const handleApprove = async (id: string) => {
    await partnerBrandingService.approve(id)
    toast.success('Logo approved for homepage')
    load()
  }

  const handleReject = async (id: string, reason: string) => {
    await partnerBrandingService.reject(id, reason)
    toast.success('Logo rejected')
    load()
  }

  const toggleVisible = async (item: PartnerBrandingAdminItem) => {
    try {
      await partnerBrandingService.setVisibility(item.id, !item.visible)
      toast.success(item.visible ? 'Hidden from homepage' : 'Visible on homepage')
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
        <AdminPageHero
          title="Partner logos"
          subtitle="Review corporate logos before they appear on the Disha homepage partner strip. Profile and job logos are unchanged."
          chips={[
            {
              label: `${stats.pending} Pending`,
              tone: 'orange',
              icon: <Clock className="w-3.5 h-3.5" />,
            },
            {
              label: `${stats.approved_visible} Live`,
              tone: 'green',
              icon: <CheckCircle className="w-3.5 h-3.5" />,
            },
            {
              label: `${stats.rejected} Rejected`,
              tone: 'purple',
              icon: <XCircle className="w-3.5 h-3.5" />,
            },
          ]}
        />

        <div className={cn(adminCard, 'p-4')}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex space-x-1 bg-gray-100 dark:bg-white/[0.06] p-1 rounded-xl self-start">
              {(
                [
                  ['queue', 'Review queue', stats.pending],
                  ['live', 'Live on site', stats.approved_visible],
                  ['rejected', 'Rejected', stats.rejected],
                ] as const
              ).map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                    tab === key
                      ? 'bg-white dark:bg-[#0D1628] text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  <ImageIcon className="w-4 h-4" />
                  {label}
                  {key === 'queue' && count > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search company…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => load()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              {tab === 'queue' ? 'No logos waiting for review.' : 'Nothing to show in this tab.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[4.5rem]" />
                  <col />
                  <col className="w-[7.5rem] max-md:hidden" />
                  <col className="w-[8.5rem]" />
                  <col className="w-[6.5rem]" />
                </colgroup>
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-3 pl-1 pr-3 font-medium align-bottom">Logo</th>
                    <th className="pb-3 px-3 font-medium align-bottom">Company</th>
                    <th className="pb-3 px-3 font-medium align-bottom hidden md:table-cell">Submitted</th>
                    <th className="pb-3 px-3 font-medium align-bottom">Status</th>
                    <th className="pb-3 pl-3 pr-1 font-medium text-right align-bottom">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 dark:border-gray-800/80 hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                    >
                      <td className="py-3 pl-1 pr-3 align-middle">
                        <div className="h-12 w-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white p-1 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.proposed_logo_url}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 align-middle min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{item.company_name}</div>
                        <div className="text-xs text-gray-500 truncate">{item.corporate_email}</div>
                      </td>
                      <td className="py-3 px-3 align-middle hidden md:table-cell text-gray-500 whitespace-nowrap">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 align-middle">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
                            item.status === 'pending' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
                            item.status === 'approved' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
                            item.status === 'rejected' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                          )}
                        >
                          {item.status}
                          {item.status === 'approved' && item.visible ? ' · live' : ''}
                        </span>
                      </td>
                      <td className="py-3 pl-3 pr-1 align-middle text-right whitespace-nowrap">
                        {tab === 'queue' && (
                          <button
                            type="button"
                            onClick={() => openReview(item)}
                            className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                          >
                            Review
                          </button>
                        )}
                        {tab === 'live' && (
                          <button
                            type="button"
                            onClick={() => toggleVisible(item)}
                            className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          >
                            {item.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {item.visible ? 'Hide' : 'Show'}
                          </button>
                        )}
                        {tab === 'rejected' && item.rejection_reason && (
                          <span className="text-xs text-gray-500 max-w-[200px] inline-block truncate" title={item.rejection_reason}>
                            {item.rejection_reason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <PartnerLogoReviewModal
        item={selected}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </AdminDashboardLayout>
  )
}
