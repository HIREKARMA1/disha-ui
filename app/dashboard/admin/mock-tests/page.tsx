'use client'

import { useMemo, useState, useEffect } from 'react'
import { MockTestList } from '@/components/admin/mock-tests/MockTestList'
import { MockTestDetailsModal } from '@/components/admin/mock-tests/MockTestDetailsModal'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import Link from 'next/link'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { MobileFilterBottomSheet } from '@/components/ui/MobileFilterBottomSheet'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import { adminCard, adminInput } from '@/components/admin/ui/admin-theme'
import { cn } from '@/lib/utils'

interface MockTest {
  id: string
  disha_assessment_id: string
  assessment_name: string
  mode: string
  status: string
  total_duration_minutes: number
  round_count: number
  rounds?: any[]
  created_at: string
  description?: string
  instructions?: string
}

const selectClass = cn(adminInput, 'px-3 py-2.5 text-sm')

export default function MockTestsPage() {
  const [mockTests, setMockTests] = useState<MockTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [draftStatus, setDraftStatus] = useState('all')

  const [selectedMockTest, setSelectedMockTest] = useState<MockTest | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const activeFilterCount = useMemo(() => (filters.status !== 'all' ? 1 : 0), [filters.status])

  const fetchMockTests = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getAdminMockTests()
      setMockTests(data || [])
    } catch (err: any) {
      console.error('Failed to fetch mock tests:', err)
      setError(err.message || 'Failed to load mock tests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMockTests()
  }, [])

  const handleEdit = (id: string) => {
    window.location.href = `/dashboard/admin/mock-tests/${id}/edit`
  }

  const handleView = (id: string) => {
    const mockTest = mockTests.find((m) => m.id === id)
    if (mockTest) {
      setSelectedMockTest(mockTest)
      setIsViewModalOpen(true)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteMockTest(id)
      fetchMockTests()
    } catch (err) {
      alert('Failed to delete mock test')
    }
  }

  const filteredMockTests = mockTests.filter((mockTest) => {
    if (filters.status !== 'all' && mockTest.status !== filters.status) return false
    if (
      filters.search &&
      !mockTest.assessment_name.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false
    return true
  })

  const openSheet = () => {
    setDraftStatus(filters.status)
    setSheetOpen(true)
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
        <AdminPageHero
          title="Mock Tests"
          subtitle="Create practice exams published to every student on Disha."
          chips={[
            {
              label: `${mockTests.length} Mock Tests`,
              tone: 'purple',
              icon: <FileText className="w-3.5 h-3.5" />,
            },
          ]}
          actions={
            <Link href="/dashboard/admin/mock-tests/create">
              <Button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 text-white shadow-md shadow-blue-500/20 transition-all hover:opacity-95 sm:w-auto">
                <Plus size={20} strokeWidth={2.5} />
                <span className="font-semibold">Create Mock Test</span>
              </Button>
            </Link>
          }
        />

        <div className={cn(adminCard, 'p-4')}>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <input
                type="text"
                placeholder="Search mock tests..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={cn(adminInput, 'py-2.5 pl-10 pr-4 text-sm')}
                aria-label="Search mock tests"
              />
              <svg
                className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <MobileFilterBottomSheet
              open={sheetOpen}
              onOpenChange={(open) => {
                if (open) openSheet()
                else setSheetOpen(false)
              }}
              activeCount={activeFilterCount}
              onApply={() => setFilters((prev) => ({ ...prev, status: draftStatus }))}
              onClear={() => {
                setDraftStatus('all')
                setFilters((prev) => ({ ...prev, status: 'all' }))
              }}
              clearLabel="Reset"
              applyLabel="Apply"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </MobileFilterBottomSheet>
          </div>

          {/* Desktop filters */}
          <div className="mt-3 hidden gap-3 md:grid md:grid-cols-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={selectClass}
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {error && !isLoading && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {error}
          </div>
        )}

        <MockTestList
          mockTests={filteredMockTests}
          loading={isLoading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />

        <MockTestDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          mockTest={selectedMockTest}
        />
      </div>
    </AdminDashboardLayout>
  )
}
