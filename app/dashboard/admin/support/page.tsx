"use client"

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Headphones, PhoneCall } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminPageHero, AdminPagination, AdminStatCard } from '@/components/admin/ui'
import { SupportToolbar } from '@/components/dashboard/admin/support/SupportToolbar'
import { SupportQueryTable } from '@/components/dashboard/admin/support/SupportQueryTable'
import { supportQueryService } from '@/services/supportQueryService'
import {
  SupportEnquiryType,
  SupportPaymentDecision,
  SupportQuery,
  SupportQueryKpis,
  SupportQueryStatus,
} from '@/types/supportQuery'
import { downloadSupportQueriesSheet } from '@/utils/exportSupportQueries'
import { getErrorMessage } from '@/lib/error-handler'

const PAGE_SIZE = 20
const EMPTY_KPIS: SupportQueryKpis = { total: 0, not_resolved: 0, connected: 0, resolved: 0 }

export default function AdminSupportPage() {
  const [queries, setQueries] = useState<SupportQuery[]>([])
  const [kpis, setKpis] = useState<SupportQueryKpis>(EMPTY_KPIS)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasFetched, setHasFetched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [enquiryFilter, setEnquiryFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [updatingQueryNumber, setUpdatingQueryNumber] = useState<number | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, enquiryFilter, dateFrom, dateTo])

  const listParams = useCallback(() => {
    return {
      status: statusFilter === 'all' ? ('' as const) : (statusFilter as SupportQueryStatus),
      enquiry_type:
        enquiryFilter === 'all' ? ('' as const) : (enquiryFilter as SupportEnquiryType),
      q: debouncedSearch,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }
  }, [statusFilter, enquiryFilter, debouncedSearch, dateFrom, dateTo])

  const fetchQueries = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await supportQueryService.list({
        ...listParams(),
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      })
      setQueries(response.queries || [])
      setTotal(response.total || 0)
      setKpis(response.kpis || EMPTY_KPIS)
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load support queries.')
      setError(message)
      setQueries([])
      toast.error(message)
    } finally {
      setHasFetched(true)
      setIsLoading(false)
    }
  }, [listParams, page])

  useEffect(() => {
    fetchQueries()
  }, [fetchQueries])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const rows = await supportQueryService.listAll(listParams())
      if (rows.length === 0) {
        toast.error('No queries to download for the current filters.')
        return
      }
      downloadSupportQueriesSheet(rows)
      toast.success(`Downloaded ${rows.length} ${rows.length === 1 ? 'query' : 'queries'}.`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to download the query sheet.'))
    } finally {
      setIsDownloading(false)
    }
  }

  const handleStatusChange = async (queryNumber: number, status: SupportQueryStatus) => {
    setUpdatingQueryNumber(queryNumber)
    try {
      await supportQueryService.updateStatus(queryNumber, status)
      toast.success(`Query #${queryNumber} updated to ${status.replace(/_/g, ' ')}`)
      await fetchQueries()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update query status.'))
    } finally {
      setUpdatingQueryNumber(null)
    }
  }

  const handlePaymentDecision = async (
    queryNumber: number,
    decision: SupportPaymentDecision
  ) => {
    setUpdatingQueryNumber(queryNumber)
    try {
      await supportQueryService.updatePayment(queryNumber, decision)
      toast.success(`Query #${queryNumber} payment ${decision}`)
      await fetchQueries()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update payment decision.'))
    } finally {
      setUpdatingQueryNumber(null)
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <AdminPageHero
          title="Support"
          subtitle="WhatsApp customer queries captured by the HireKarma bot"
        />

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          <AdminStatCard
            label="Total queries"
            value={kpis.total}
            icon={Headphones}
            accent="blue"
            index={0}
            compact
            isLoading={!hasFetched}
            onClick={() => setStatusFilter('all')}
          />
          <AdminStatCard
            label="Not resolved"
            value={kpis.not_resolved}
            icon={AlertCircle}
            accent="orange"
            index={1}
            compact
            isLoading={!hasFetched}
            onClick={() => setStatusFilter('not_resolved')}
          />
          <AdminStatCard
            label="Connected"
            value={kpis.connected}
            icon={PhoneCall}
            accent="teal"
            index={2}
            compact
            isLoading={!hasFetched}
            onClick={() => setStatusFilter('connected')}
          />
          <AdminStatCard
            label="Resolved"
            value={kpis.resolved}
            icon={CheckCircle2}
            accent="green"
            index={3}
            compact
            isLoading={!hasFetched}
            onClick={() => setStatusFilter('resolved')}
          />
        </div>

        <SupportToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          enquiryFilter={enquiryFilter}
          onEnquiryFilterChange={setEnquiryFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          disableDownload={total === 0}
        />

        <SupportQueryTable
          queries={queries}
          isLoading={isLoading}
          error={error}
          updatingQueryNumber={updatingQueryNumber}
          onRetry={fetchQueries}
          onStatusChange={handleStatusChange}
          onPaymentDecision={handlePaymentDecision}
        />

        {total > 0 && (
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="queries"
          />
        )}
      </div>
    </AdminDashboardLayout>
  )
}
