"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  Eye,
  FileQuestion,
  Filter,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  Users,
  X,
  XCircle,
  Send,
  Ban,
  ClipboardList,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { LoadingSkeleton, TableSkeleton, StatsSkeleton } from '@/components/ui/LoadingSkeleton'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard'
import { getErrorMessage } from '@/lib/error-handler'
import {
  useAdminMockTests,
  useAdminMockTest,
  useCreateMockTest,
  useUpdateMockTest,
  useDeleteMockTest,
  usePublishMockTest,
  useUnpublishMockTest,
  useDuplicateMockTest,
  useGenerateMockQuestions,
  useCreateMockQuestion,
  useUpdateMockQuestion,
  useDeleteMockQuestion,
  useMockTestAttempts,
  useMockTestAnalytics,
} from '@/hooks/useMockTest'
import type {
  CreateMockTestPayload,
  CreateMockTestQuestionPayload,
  MockDifficulty,
  MockTest,
  MockTestQuestion,
  MockTestStatus,
  UpdateMockTestPayload,
} from '@/types/mockTest'

type ViewState = 'list' | 'detail'
type DetailTab = 'questions' | 'attempts' | 'analytics'

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

const inputClass =
  'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent'
const searchInputClass =
  'w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1520] text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all duration-200'
const selectClass =
  'pl-10 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none min-w-[160px]'
const glassCardClass =
  'rounded-[18px] border border-gray-200/70 dark:border-white/[0.08] bg-white/90 dark:bg-[#0D1628] backdrop-blur-md shadow-sm'

function statusBadgeClass(status: string) {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    case 'unpublished':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

function difficultyBadgeClass(difficulty?: string) {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
  }
}

function formatDuration(seconds: number) {
  const mins = Math.floor((seconds || 0) / 60)
  return `${mins}m`
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export function AdminMockTestManager() {
  const [currentView, setCurrentView] = useState<ViewState>('list')
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('questions')

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | MockTestStatus>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | MockDifficulty>('all')

  const [isMounted, setIsMounted] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTest, setEditingTest] = useState<MockTest | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    variant: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger',
  })

  const [detailRefreshKey, setDetailRefreshKey] = useState(0)

  const bumpDetailRefresh = () => setDetailRefreshKey((k) => k + 1)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const listFilters = useMemo(
    () => ({
      difficulty: difficultyFilter === 'all' ? undefined : difficultyFilter,
      search_term: debouncedSearch || undefined,
    }),
    [difficultyFilter, debouncedSearch]
  )

  const {
    data: tests,
    isLoading,
    error,
    refetch,
  } = useAdminMockTests(listFilters)

  const createMutation = useCreateMockTest()
  const updateMutation = useUpdateMockTest()
  const deleteMutation = useDeleteMockTest()
  const publishMutation = usePublishMockTest()
  const unpublishMutation = useUnpublishMockTest()
  const duplicateMutation = useDuplicateMockTest()

  const filteredTests = useMemo(() => {
    if (statusFilter === 'all') return tests || []
    return (tests || []).filter((t) => t.status === statusFilter)
  }, [tests, statusFilter])

  const stats = useMemo(() => {
    const list = tests || []
    return {
      total: list.length,
      draft: list.filter((t) => t.status === 'draft').length,
      published: list.filter((t) => t.status === 'published').length,
      unpublished: list.filter((t) => t.status === 'unpublished').length,
    }
  }, [tests])

  const openDetail = (test: MockTest, tab: DetailTab = 'questions') => {
    setSelectedTestId(test.id)
    setDetailTab(tab)
    setCurrentView('detail')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedTestId(null)
    setDetailTab('questions')
    refetch()
  }

  const openCreateForm = () => {
    setEditingTest(null)
    setIsFormOpen(true)
  }

  const openEditForm = (test: MockTest) => {
    setEditingTest(test)
    setIsFormOpen(true)
  }

  const handleSaveForm = async (payload: CreateMockTestPayload | UpdateMockTestPayload) => {
    setIsSaving(true)
    try {
      if (editingTest) {
        await updateMutation.mutateAsync(editingTest.id, payload)
        toast.success('Mock test updated successfully')
      } else {
        await createMutation.mutateAsync(payload as CreateMockTestPayload)
        toast.success('Mock test created successfully')
      }
      setIsFormOpen(false)
      setEditingTest(null)
      refetch()
      bumpDetailRefresh()
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to save mock test')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async (test: MockTest) => {
    try {
      await publishMutation.mutateAsync(test.id)
      toast.success('Mock test published')
      refetch()
      bumpDetailRefresh()
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to publish. Ensure questions exist.')
    }
  }

  const handleUnpublish = async (test: MockTest) => {
    try {
      await unpublishMutation.mutateAsync(test.id)
      toast.success('Mock test unpublished')
      refetch()
      bumpDetailRefresh()
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to unpublish')
    }
  }

  const handleDuplicate = async (test: MockTest) => {
    try {
      await duplicateMutation.mutateAsync(test.id)
      toast.success('Mock test duplicated')
      refetch()
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to duplicate')
    }
  }

  const handleDelete = (test: MockTest) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Mock Test',
      message: `Are you sure you want to delete "${test.title}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(test.id)
          toast.success('Mock test deleted')
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
          if (selectedTestId === test.id) {
            handleBackToList()
          } else {
            refetch()
          }
        } catch (err) {
          toast.error(getErrorMessage(err) || 'Failed to delete mock test')
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDebouncedSearch('')
    setStatusFilter('all')
    setDifficultyFilter('all')
  }

  if (currentView === 'detail' && selectedTestId) {
    return (
      <>
        <MockTestDetailView
          mockTestId={selectedTestId}
          initialTab={detailTab}
          refreshKey={detailRefreshKey}
          onBack={handleBackToList}
          onEdit={(test) => openEditForm(test)}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onRequestDeleteQuestionConfirm={(title, message, onConfirm) =>
            setConfirmationModal({
              isOpen: true,
              title,
              message,
              onConfirm,
              variant: 'danger',
            })
          }
          closeConfirmation={() =>
            setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
          }
        />
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          variant={confirmationModal.variant}
          confirmText="Delete"
          isLoading={deleteMutation.isPending}
        />
        {isMounted &&
          isFormOpen &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4">
              <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
                <MockTestForm
                  mockTest={editingTest}
                  isSaving={isSaving}
                  onSave={handleSaveForm}
                  onCancel={() => {
                    setIsFormOpen(false)
                    setEditingTest(null)
                  }}
                />
              </div>
            </div>,
            document.body
          )}
      </>
    )
  }

  return (
    <>
      <div className="space-y-6 main-content">
        <AdminPageHero
          title="Mock Test Management"
          subtitle="Create, publish, and analyze AI-powered mock tests for students."
          chips={[
            {
              label: new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              }),
              tone: 'blue',
              icon: <FileQuestion className="w-3.5 h-3.5" />,
            },
            {
              label: 'Question Generation',
              tone: 'green',
              icon: <Sparkles className="w-3.5 h-3.5" />,
            },
            {
              label: 'Student Analytics',
              tone: 'purple',
              icon: <BarChart3 className="w-3.5 h-3.5" />,
            },
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            label="Total"
            value={stats.total}
            icon={ClipboardList}
            accent="blue"
            index={0}
            isLoading={isLoading}
          />
          <AdminStatCard
            label="Draft"
            value={stats.draft}
            icon={Edit}
            accent="gray"
            index={1}
            isLoading={isLoading}
          />
          <AdminStatCard
            label="Published"
            value={stats.published}
            icon={CheckCircle2}
            accent="green"
            index={2}
            isLoading={isLoading}
          />
          <AdminStatCard
            label="Unpublished"
            value={stats.unpublished}
            icon={Ban}
            accent="orange"
            index={3}
            isLoading={isLoading}
          />
        </div>

        <div className={`${glassCardClass} p-4 md:p-6`}>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search mock tests by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={searchInputClass}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | MockTestStatus)}
                className={selectClass}
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={difficultyFilter}
                onChange={(e) =>
                  setDifficultyFilter(e.target.value as 'all' | MockDifficulty)
                }
                className={selectClass}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            {(searchTerm || statusFilter !== 'all' || difficultyFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={openCreateForm}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Mock Test
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-6">
            <StatsSkeleton count={4} />
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-4">
                <LoadingSkeleton height="h-6" width="w-48" />
              </div>
              <TableSkeleton rows={5} columns={7} />
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700 p-6">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading mock tests
                </h3>
                <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error.message}</p>
                <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Mock Test
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No mock tests found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map((test, index) => (
                      <motion.tr
                        key={test.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center min-w-0">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                              <FileQuestion className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {test.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {test.short_description || test.description || 'No description'}
                              </div>
                              {test.topics?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {test.topics.slice(0, 3).map((topic) => (
                                    <span
                                      key={topic}
                                      className="px-1.5 py-0.5 text-[10px] rounded bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                  {test.topics.length > 3 && (
                                    <span className="text-[10px] text-gray-400">
                                      +{test.topics.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusBadgeClass(test.status)}`}
                          >
                            {test.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${difficultyBadgeClass(test.difficulty)}`}
                          >
                            {test.difficulty || 'medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {test.questions_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDuration(test.duration_seconds)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              title="View / Manage questions"
                              onClick={() => openDetail(test, 'questions')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Edit"
                              onClick={() => openEditForm(test)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {test.status !== 'published' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                title="Publish"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handlePublish(test)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                title="Unpublish"
                                className="text-amber-600 hover:text-amber-700"
                                onClick={() => handleUnpublish(test)}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              title="Duplicate"
                              onClick={() => handleDuplicate(test)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Attempts"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => openDetail(test, 'attempts')}
                            >
                              <Users className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Analytics"
                              className="text-purple-600 hover:text-purple-700"
                              onClick={() => openDetail(test, 'analytics')}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Delete"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(test)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        variant={confirmationModal.variant}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />

      {isMounted &&
        isFormOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
              <MockTestForm
                mockTest={editingTest}
                isSaving={isSaving}
                onSave={handleSaveForm}
                onCancel={() => {
                  setIsFormOpen(false)
                  setEditingTest(null)
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

/* ───────────────────────── Form ───────────────────────── */

interface MockTestFormProps {
  mockTest?: MockTest | null
  isSaving?: boolean
  onSave: (payload: CreateMockTestPayload) => void | Promise<void>
  onCancel: () => void
}

function MockTestForm({ mockTest, isSaving, onSave, onCancel }: MockTestFormProps) {
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [difficulty, setDifficulty] = useState<MockDifficulty>('medium')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [questionsCount, setQuestionsCount] = useState(20)
  const [instructions, setInstructions] = useState('')
  const [passingPercentage, setPassingPercentage] = useState<string>('40')

  useEffect(() => {
    if (mockTest) {
      setTitle(mockTest.title || '')
      setShortDescription(mockTest.short_description || '')
      setDescription(mockTest.description || '')
      setTopics(mockTest.topics || [])
      setDifficulty((mockTest.difficulty as MockDifficulty) || 'medium')
      setDurationMinutes(Math.max(1, Math.floor((mockTest.duration_seconds || 3600) / 60)))
      setQuestionsCount(mockTest.questions_count || 20)
      setInstructions(mockTest.instructions || '')
      setPassingPercentage(
        mockTest.passing_percentage != null ? String(mockTest.passing_percentage) : ''
      )
    }
  }, [mockTest])

  const addTopic = () => {
    const parts = topicInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    setTopics((prev) => {
      const next = [...prev]
      parts.forEach((p) => {
        if (!next.includes(p)) next.push(p)
      })
      return next
    })
    setTopicInput('')
  }

  const removeTopic = (topic: string) => {
    setTopics((prev) => prev.filter((t) => t !== topic))
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (topics.length === 0) {
      toast.error('Add at least one topic')
      return
    }
    if (durationMinutes < 1) {
      toast.error('Duration must be at least 1 minute')
      return
    }
    if (questionsCount < 1) {
      toast.error('Questions count must be at least 1')
      return
    }

    const passing =
      passingPercentage.trim() === ''
        ? null
        : Number(passingPercentage)

    if (passing != null && (Number.isNaN(passing) || passing < 0 || passing > 100)) {
      toast.error('Passing percentage must be between 0 and 100')
      return
    }

    const payload: CreateMockTestPayload = {
      title: title.trim(),
      short_description: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      topics,
      difficulty,
      duration_seconds: durationMinutes * 60,
      questions_count: questionsCount,
      instructions: instructions.trim() || undefined,
      passing_percentage: passing,
    }
    onSave(payload)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4 border border-primary-200 dark:border-primary-700 relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-700 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="pr-10">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {mockTest ? 'Edit Mock Test' : 'Create Mock Test'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {mockTest
              ? 'Update mock test settings and targets'
              : 'Set up a new mock test for students'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Full Stack Developer Mock Test"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary shown in listings"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the mock test..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instructions shown to students before starting..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Topics *</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTopic()
                  }
                }}
                placeholder="Add topics (comma-separated or press Enter)"
                className={`flex-1 ${inputClass}`}
              />
              <Button type="button" variant="outline" onClick={addTopic}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as MockDifficulty)}
                className={inputClass}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Questions Count
              </label>
              <input
                type="number"
                min={1}
                value={questionsCount}
                onChange={(e) => setQuestionsCount(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Passing Percentage
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(e.target.value)}
                placeholder="e.g., 40"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
            >
              {isSaving ? 'Saving...' : mockTest ? 'Update Mock Test' : 'Create Mock Test'}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Detail View ───────────────────────── */

interface MockTestDetailViewProps {
  mockTestId: string
  initialTab: DetailTab
  refreshKey: number
  onBack: () => void
  onEdit: (test: MockTest) => void
  onPublish: (test: MockTest) => void
  onUnpublish: (test: MockTest) => void
  onDuplicate: (test: MockTest) => void
  onDelete: (test: MockTest) => void
  onRequestDeleteQuestionConfirm: (
    title: string,
    message: string,
    onConfirm: () => void
  ) => void
  closeConfirmation: () => void
}

function MockTestDetailView({
  mockTestId,
  initialTab,
  refreshKey,
  onBack,
  onEdit,
  onPublish,
  onUnpublish,
  onDuplicate,
  onDelete,
  onRequestDeleteQuestionConfirm,
  closeConfirmation,
}: MockTestDetailViewProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab)
  const { data: mockTest, isLoading, error, refetch } = useAdminMockTest(mockTestId)
  const generateMutation = useGenerateMockQuestions()
  const createQuestion = useCreateMockQuestion()
  const updateQuestion = useUpdateMockQuestion()
  const deleteQuestion = useDeleteMockQuestion()

  const [editingQuestion, setEditingQuestion] = useState<MockTestQuestion | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (refreshKey > 0) {
      refetch()
    }
  }, [refreshKey, refetch])

  const questions = mockTest?.questions || []

  const handleGenerate = async () => {
    if (!mockTest) return
    setIsGenerating(true)
    try {
      await generateMutation.mutateAsync(mockTest.id, {
        count: mockTest.questions_count || 10,
        topics: mockTest.topics,
        difficulty: mockTest.difficulty as MockDifficulty | undefined,
      })
      toast.success('Questions generated successfully')
      refetch()
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to generate questions')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveQuestion = async (
    payload: CreateMockTestQuestionPayload,
    questionId?: string
  ) => {
    if (!mockTest) return
    try {
      if (questionId) {
        await updateQuestion.mutateAsync(mockTest.id, questionId, payload)
        toast.success('Question updated')
      } else {
        await createQuestion.mutateAsync(mockTest.id, payload)
        toast.success('Question added')
      }
      setEditingQuestion(null)
      setShowAddForm(false)
      refetch()
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to save question')
    }
  }

  const handleDeleteQuestion = (question: MockTestQuestion) => {
    if (!mockTest) return
    onRequestDeleteQuestionConfirm(
      'Delete Question',
      'Are you sure you want to delete this question?',
      async () => {
        try {
          await deleteQuestion.mutateAsync(mockTest.id, question.id)
          toast.success('Question deleted')
          closeConfirmation()
          refetch()
        } catch (err) {
          toast.error(getErrorMessage(err) || 'Failed to delete question')
          closeConfirmation()
        }
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 main-content p-6">
        <LoadingSkeleton height="h-32" width="w-full" />
        <LoadingSkeleton height="h-64" width="w-full" />
      </div>
    )
  }

  if (error || !mockTest) {
    return (
      <div className="space-y-6 main-content">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700 p-6">
          <p className="text-red-700 dark:text-red-300">
            {error?.message || 'Mock test not found'}
          </p>
        </div>
      </div>
    )
  }

  const tabs: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'questions', label: 'Questions', icon: <FileQuestion className="w-4 h-4" /> },
    { id: 'attempts', label: 'Attempts', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6 main-content">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="border-primary-200 dark:border-primary-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mock Tests
            </Button>
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusBadgeClass(mockTest.status)}`}
            >
              {mockTest.status}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${difficultyBadgeClass(mockTest.difficulty)}`}
            >
              {mockTest.difficulty || 'medium'}
            </span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {mockTest.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {mockTest.short_description || mockTest.description || 'No description'}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDuration(mockTest.duration_seconds)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              Target: {mockTest.questions_count} questions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileQuestion className="w-4 h-4" />
              Loaded: {questions.length}
            </span>
            {mockTest.passing_percentage != null && (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Pass: {mockTest.passing_percentage}%
              </span>
            )}
          </div>

          {mockTest.topics?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mockTest.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/70 dark:bg-white/10 text-primary-800 dark:text-primary-200 border border-primary-200/60 dark:border-primary-700/40"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(mockTest)}>
              <Edit className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
            {mockTest.status !== 'published' ? (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600"
                onClick={() => onPublish(mockTest)}
              >
                <Send className="w-4 h-4 mr-1.5" />
                Publish
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-amber-600"
                onClick={() => onUnpublish(mockTest)}
              >
                <Ban className="w-4 h-4 mr-1.5" />
                Unpublish
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onDuplicate(mockTest)}>
              <Copy className="w-4 h-4 mr-1.5" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600"
              onClick={() => onDelete(mockTest)}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className={`${glassCardClass} p-4 md:p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Questions ({questions.length})
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate with AI or add MCQs manually
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || generateMutation.isPending}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Questions'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingQuestion(null)
                    setShowAddForm(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
          </div>

          {(showAddForm || editingQuestion) && (
            <QuestionForm
              question={editingQuestion}
              onSave={handleSaveQuestion}
              onCancel={() => {
                setShowAddForm(false)
                setEditingQuestion(null)
              }}
            />
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {questions.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                <FileQuestion className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="mb-4">No questions yet. Generate or add them manually.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingQuestion(null)
                    setShowAddForm(true)
                  }}
                >
                  Add First Question
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-5 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            {(question.type || 'mcq_single').replace('_', ' ')}
                          </span>
                          {question.is_ai_generated && (
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200">
                              AI
                            </span>
                          )}
                          {question.difficulty && (
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${difficultyBadgeClass(question.difficulty)}`}
                            >
                              {question.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium mb-3">
                          {question.statement}
                        </p>
                        <div className="space-y-2">
                          {(question.options || []).map((option) => {
                            const isCorrect = question.correct_options?.includes(option.id)
                            return (
                              <div key={option.id} className="flex items-center gap-3">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    isCorrect
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                  }`}
                                >
                                  {option.id}
                                </span>
                                <span
                                  className={`text-sm ${
                                    isCorrect
                                      ? 'text-green-800 dark:text-green-200 font-medium'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {option.text}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        {question.explanation && (
                          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Explanation:{' '}
                            </span>
                            {question.explanation}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600"
                          onClick={() => {
                            setShowAddForm(false)
                            setEditingQuestion(question)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDeleteQuestion(question)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'attempts' && <AttemptsPanel mockTestId={mockTestId} />}
      {activeTab === 'analytics' && <AnalyticsPanel mockTestId={mockTestId} />}
    </div>
  )
}

/* ───────────────────────── Question Form ───────────────────────── */

interface QuestionFormProps {
  question?: MockTestQuestion | null
  onSave: (payload: CreateMockTestQuestionPayload, questionId?: string) => void | Promise<void>
  onCancel: () => void
}

function QuestionForm({ question, onSave, onCancel }: QuestionFormProps) {
  const [statement, setStatement] = useState('')
  const [options, setOptions] = useState<Record<string, string>>({
    A: '',
    B: '',
    C: '',
    D: '',
  })
  const [correctLetter, setCorrectLetter] = useState<(typeof OPTION_LETTERS)[number]>('A')
  const [explanation, setExplanation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (question) {
      setStatement(question.statement || '')
      const next: Record<string, string> = { A: '', B: '', C: '', D: '' }
      ;(question.options || []).forEach((opt, idx) => {
        const letter = (opt.id || OPTION_LETTERS[idx] || String.fromCharCode(65 + idx)).toUpperCase()
        if (OPTION_LETTERS.includes(letter as (typeof OPTION_LETTERS)[number])) {
          next[letter] = opt.text || ''
        }
      })
      setOptions(next)
      const correct = (question.correct_options?.[0] || 'A').toUpperCase()
      setCorrectLetter(
        OPTION_LETTERS.includes(correct as (typeof OPTION_LETTERS)[number])
          ? (correct as (typeof OPTION_LETTERS)[number])
          : 'A'
      )
      setExplanation(question.explanation || '')
    } else {
      setStatement('')
      setOptions({ A: '', B: '', C: '', D: '' })
      setCorrectLetter('A')
      setExplanation('')
    }
  }, [question])

  const handleSubmit = async () => {
    if (!statement.trim()) {
      toast.error('Question statement is required')
      return
    }
    for (const letter of OPTION_LETTERS) {
      if (!options[letter]?.trim()) {
        toast.error(`Option ${letter} is required`)
        return
      }
    }

    const payload: CreateMockTestQuestionPayload = {
      statement: statement.trim(),
      type: 'mcq_single',
      options: OPTION_LETTERS.map((letter) => ({
        id: letter,
        text: options[letter].trim(),
      })),
      correct_options: [correctLetter],
      explanation: explanation.trim() || undefined,
    }

    setIsSubmitting(true)
    try {
      await onSave(payload, question?.id)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`${glassCardClass} p-4 md:p-6 space-y-4`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {question ? 'Edit Question' : 'Add Question'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Statement *
        </label>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={3}
          placeholder="Enter the question statement..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {OPTION_LETTERS.map((letter) => (
          <div key={letter}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Option {letter} *
            </label>
            <input
              type="text"
              value={options[letter]}
              onChange={(e) => setOptions((prev) => ({ ...prev, [letter]: e.target.value }))}
              placeholder={`Option ${letter}`}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Correct Answer *
          </label>
          <select
            value={correctLetter}
            onChange={(e) =>
              setCorrectLetter(e.target.value as (typeof OPTION_LETTERS)[number])
            }
            className={inputClass}
          >
            {OPTION_LETTERS.map((letter) => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Explanation
          </label>
          <input
            type="text"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Optional explanation"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-primary-500 to-secondary-500"
        >
          {isSubmitting ? 'Saving...' : question ? 'Update Question' : 'Add Question'}
        </Button>
      </div>
    </div>
  )
}

/* ───────────────────────── Attempts Panel ───────────────────────── */

function AttemptsPanel({ mockTestId }: { mockTestId: string }) {
  const { data: attempts, isLoading, error, refetch } = useMockTestAttempts(mockTestId)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
        <p className="text-center text-gray-500">Loading attempts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700 p-6">
        <p className="text-red-700 dark:text-red-300 mb-3">{error.message}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Attempts ({attempts.length})
        </h2>
      </div>
      {attempts.length === 0 ? (
        <div className="p-10 text-center text-gray-500 dark:text-gray-400">
          No attempts yet for this mock test.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Correct
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ended
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {attempt.student_name || attempt.student_id}
                    </div>
                    {attempt.student_email && (
                      <div className="text-xs text-gray-500">{attempt.student_email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {attempt.score_percent != null ? `${attempt.score_percent}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {attempt.correct_count}/{attempt.correct_count + attempt.incorrect_count + attempt.unanswered_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {attempt.time_taken_seconds != null
                      ? formatDuration(attempt.time_taken_seconds)
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 capitalize">
                      {attempt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(attempt.ended_at || attempt.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ───────────────────────── Analytics Panel ───────────────────────── */

function AnalyticsPanel({ mockTestId }: { mockTestId: string }) {
  const { data: analytics, isLoading, refetch } = useMockTestAnalytics(mockTestId)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
        <p className="text-center text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-3">No analytics available yet.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>
    )
  }

  const metricCards = [
    { label: 'Total Attempts', value: analytics.total_attempts, accent: 'blue' as const, icon: Users },
    { label: 'Completed', value: analytics.total_completed, accent: 'green' as const, icon: CheckCircle2 },
    { label: 'Unique Students', value: analytics.unique_students, accent: 'purple' as const, icon: Users },
    {
      label: 'Avg Score',
      value: `${Number(analytics.average_score ?? analytics.average_percentage ?? 0).toFixed(1)}%`,
      accent: 'teal' as const,
      icon: Target,
    },
    {
      label: 'Highest',
      value: `${Number(analytics.highest_score ?? 0).toFixed(1)}%`,
      accent: 'green' as const,
      icon: CheckCircle2,
    },
    {
      label: 'Lowest',
      value: `${Number(analytics.lowest_score ?? 0).toFixed(1)}%`,
      accent: 'orange' as const,
      icon: Ban,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((card, index) => (
          <AdminStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
            index={index}
          />
        ))}
      </div>

      {(analytics.pass_rate != null || analytics.average_time_seconds != null) && (
        <div className={`${glassCardClass} p-4 md:p-6 flex flex-wrap gap-6 text-sm`}>
          {analytics.pass_rate != null && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Pass Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {Number(analytics.pass_rate).toFixed(1)}%
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-500 dark:text-gray-400">Avg Time</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatDuration(analytics.average_time_seconds || 0)}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Question Performance
          </h2>
        </div>
        {!analytics.question_performance?.length ? (
          <div className="p-8 text-center text-gray-500">No question performance data yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Question
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Attempts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Correct
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analytics.question_performance.map((row) => (
                  <tr key={row.question_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {row.question_order}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-md truncate">
                      {row.statement}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {row.attempts}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {row.correct}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          row.accuracy_percent >= 70
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : row.accuracy_percent >= 40
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}
                      >
                        {Number(row.accuracy_percent).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
