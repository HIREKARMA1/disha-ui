"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Loader2, Search, Filter, ArrowLeft, Download, Brain, Target, Users, Calendar, Clock, BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import {
    exportAnalyticsToCSV,
    exportAnalyticsToPDF,
    buildAppliedStudentLookups,
    resolveAppliedStudentProfile,
    mapAttemptStudentProfileToExport,
    type AppliedStudentExport,
    type AnalyticsExport,
} from '@/utils/exportToExcel'
import {
    formatAttemptPercentage,
    formatAttemptScore,
    formatDisqualificationReason,
    formatPassFailDisplay,
    getAttemptMaxScore,
    getDisqualificationReason,
    getPassFailLabel,
    getTotalQuestionsFromAssessment,
    isAttemptEvaluated,
    normalizeAttemptRounds,
} from '@/lib/assessmentAnalytics'
import {
    buildProctoringSlots,
    countCapturedSnapshots,
    resolveSnapshotUrl,
} from '@/lib/proctoringSnapshots'

export default function AssessmentAnalyticsPage() {
    const params = useParams()
    const router = useRouter()
    const assessmentId = params.id as string

    const [attempts, setAttempts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [assessmentDetails, setAssessmentDetails] = useState<any>(null)
    const [selectedAttempt, setSelectedAttempt] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [pullingResults, setPullingResults] = useState(false)
    const [pullMessage, setPullMessage] = useState<string | null>(null)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        if (assessmentId) {
            fetchData()
        }
    }, [assessmentId])

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch attempts and assessment details in parallel
            const [attemptsData, assessmentData] = await Promise.all([
                apiClient.get(`/admin/assessments/${assessmentId}/attempts`),
                apiClient.get(`/admin/assessments/${assessmentId}`)
            ])

            setAttempts(attemptsData)
            setAssessmentDetails(assessmentData)
        } catch (err: any) {
            console.error('Failed to fetch data:', err)
            setError(err.message || 'Failed to load analytics data')
        } finally {
            setLoading(false)
        }
    }

    // Filter logic
    const filteredAttempts = attempts.filter(attempt => {
        const matchesSearch = attempt.student_id ? attempt.student_id.toLowerCase().includes(search.toLowerCase()) : false
        const matchesStatus = filterStatus === 'ALL' || attempt.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PASSED': return 'bg-green-100 text-green-800 border-green-200'
            case 'FAILED': return 'bg-red-100 text-red-800 border-red-200'
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'DISQUALIFIED': return 'bg-amber-100 text-amber-800 border-amber-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const calculateStats = () => {
        // Hybrid calculation: Use backend provided stats if available
        if (assessmentDetails?.pass_rate !== undefined || assessmentDetails?.stats?.pass_rate !== undefined) {
            return {
                passRate: assessmentDetails.pass_rate ?? assessmentDetails.stats.pass_rate,
                avgScore: assessmentDetails.avg_score ?? assessmentDetails.stats.avg_score ?? 0
            }
        }

        const evaluated = attempts.filter(a => isAttemptEvaluated(a))
        if (evaluated.length === 0) return { passRate: '0.0', avgScore: '0.0' }

        const passedCount = evaluated.filter(a => getPassFailLabel(a, assessmentDetails) === 'PASS').length
        const totalScorePct = evaluated.reduce((acc, curr) => acc + (curr.percentage || 0), 0)
        const avgPct = (totalScorePct / evaluated.length).toFixed(1)

        return {
            passRate: ((passedCount / evaluated.length) * 100).toFixed(1),
            avgScore: avgPct
        }
    }

    const stats = calculateStats()
    const totalQuestions =
        getTotalQuestionsFromAssessment(assessmentDetails) ||
        (attempts[0]?.total_questions as number | undefined) ||
        0

    const buildExportData = async (): Promise<AnalyticsExport[] | null> => {
        if (!assessmentDetails || !filteredAttempts.length) return null

        const jobId =
            assessmentDetails.passing_criteria?.job_id ||
            assessmentDetails.job_id ||
            null

        let appliedLookups = buildAppliedStudentLookups([])

        if (jobId) {
            try {
                const appliedStudents: AppliedStudentExport[] =
                    await apiClient.getAppliedStudentsAdmin(jobId)
                appliedLookups = buildAppliedStudentLookups(appliedStudents)
            } catch (err) {
                console.warn('Could not load job application extras for export:', err)
            }
        }

        return filteredAttempts.map((attempt) => {
            const maxScore = getAttemptMaxScore(attempt, assessmentDetails)
            const passFail = getPassFailLabel(attempt, assessmentDetails)
            const jobApplication = resolveAppliedStudentProfile(attempt, appliedLookups)
            const profile = mapAttemptStudentProfileToExport(attempt, jobApplication)

            return {
                email: attempt.email || attempt.student_email || '-',
                student_name: attempt.student_name || 'Unknown',
                status: attempt.status,
                total_score: attempt.total_score,
                max_score: maxScore,
                percentage: attempt.percentage,
                pass_fail: formatPassFailDisplay(passFail),
                rounds_completed: attempt.result_data?.rounds?.length || 0,
                snapshot_1_url: resolveSnapshotUrl(attempt.proctoring_snapshot_1_url),
                snapshot_2_url: resolveSnapshotUrl(attempt.proctoring_snapshot_2_url),
                snapshot_3_url: resolveSnapshotUrl(attempt.proctoring_snapshot_3_url),
                snapshot_4_url: resolveSnapshotUrl(attempt.proctoring_snapshot_4_url),
                profile,
            }
        })
    }

    const handleExport = async (format: 'csv' | 'pdf' = 'csv') => {
        if (!assessmentDetails || !filteredAttempts.length) return

        try {
            setExporting(true)
            const exportData = await buildExportData()
            if (!exportData) return
            const name = assessmentDetails.assessment_name || 'Assessment'
            if (format === 'pdf') {
                await exportAnalyticsToPDF(exportData, name)
            } else {
                exportAnalyticsToCSV(exportData, name)
            }
        } finally {
            setExporting(false)
        }
    }

    const hasAwaitingResults = attempts.some((a) => !isAttemptEvaluated(a))

    return (
        <AdminDashboardLayout>
            <div className="space-y-6 pb-10">
                {/* Header Section */}
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                                {assessmentDetails?.assessment_name || 'Assessment'} Analytics 📊
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Detailed insights and student performance records ✨
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                                    🎓 Student Reports
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {totalQuestions > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        This assessment has <strong>{totalQuestions}</strong> questions across{' '}
                        {assessmentDetails?.rounds?.length ?? 0} round(s).
                    </p>
                )}

                {hasAwaitingResults && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-4 text-sm text-amber-900 dark:text-amber-100">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                                <p className="font-semibold">Some attempts are still in progress</p>
                                <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
                                    Results appear here automatically when students submit, are auto-submitted,
                                    or are disqualified. Refresh to load the latest data.
                                </p>
                                {pullMessage && (
                                    <p className="mt-2 text-amber-900 dark:text-amber-100">{pullMessage}</p>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                className="shrink-0 border-amber-300 bg-white hover:bg-amber-50 dark:bg-gray-900"
                                onClick={async () => {
                                    setPullingResults(true)
                                    setPullMessage(null)
                                    try {
                                        await fetchData()
                                        setPullMessage('Refreshed latest attempt results.')
                                    } catch (err: any) {
                                        setPullMessage(err.message || 'Could not refresh results')
                                    } finally {
                                        setPullingResults(false)
                                    }
                                }}
                                disabled={pullingResults}
                            >
                                {pullingResults ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                Refresh results
                            </Button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md bg-blue-50 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Total Attempts
                                </p>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {attempts.length}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Pass Rate
                                </p>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.passRate}%
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                <Target className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md bg-purple-50 dark:bg-purple-900/20">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Average Score
                                </p>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.avgScore}%
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                <Brain className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Student Name or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:outline-none"
                            />
                        </div>
                        <div className="sm:w-48">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:outline-none"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PASSED">Passed</option>
                                <option value="FAILED">Failed</option>
                                <option value="DISQUALIFIED">Disqualified</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => void handleExport('csv')}
                            disabled={filteredAttempts.length === 0 || exporting}
                        >
                            {exporting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} />
                            )}
                            Export CSV
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => void handleExport('pdf')}
                            disabled={filteredAttempts.length === 0 || exporting}
                        >
                            {exporting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} />
                            )}
                            Export PDF
                        </Button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                                <p className="text-gray-500 text-sm">Loading results...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                                    <span className="text-red-600 font-bold text-xl">!</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Results</h3>
                                <p className="text-gray-500 text-sm mb-4">{error}</p>
                                <Button onClick={fetchData} variant="outline">
                                    Try Again
                                </Button>
                            </div>
                        ) : filteredAttempts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                    <Filter className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-900 font-medium">No results found</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    {attempts.length === 0 ? "No student has attempted this assessment yet." : "No results match your filters."}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-medium text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4">Student Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Percentage</th>
                                        <th className="px-6 py-4">Pass/Fail</th>
                                        <th className="px-6 py-4">Rounds</th>
                                        <th className="px-6 py-4">Photos</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredAttempts.map((attempt) => (
                                        <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                            {/* Student Name */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                                                        {attempt.student_name ? attempt.student_name.substring(0, 2).toUpperCase() : 'ST'}
                                                    </div>
                                                    <span>{attempt.student_name || "Unknown Student"}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isAttemptEvaluated(attempt) ? 'bg-blue-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                                                    {isAttemptEvaluated(attempt) ? 'EVALUATED' : 'AWAITING RESULTS'}
                                                </span>
                                            </td>

                                            {/* Score */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                                {formatAttemptScore(attempt, assessmentDetails)}
                                            </td>

                                            {/* Percentage */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-semibold ${!isAttemptEvaluated(attempt) ? 'text-gray-500' :
                                                    (attempt.percentage ?? 0) >= 60 ? 'text-green-600' :
                                                        (attempt.percentage ?? 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {formatAttemptPercentage(attempt)}
                                                </span>
                                            </td>

                                            {/* Pass/Fail */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {(() => {
                                                    const label = getPassFailLabel(attempt, assessmentDetails)
                                                    return (
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${label === 'PASS' ? 'bg-blue-600 text-white' :
                                                                label === 'FAIL' ? 'bg-red-500 text-white' :
                                                                    label === 'MALPRACTICE' ? 'bg-amber-500 text-white' :
                                                                    'bg-gray-200 text-gray-700'
                                                            }`}>
                                                            {formatPassFailDisplay(label)}
                                                        </span>
                                                    )
                                                })()}
                                            </td>

                                            {/* Rounds */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {attempt.result_data?.rounds?.length ?? '—'}
                                            </td>

                                            {/* Proctoring photos */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                <div className="flex flex-col gap-1">
                                                    <span>{countCapturedSnapshots(attempt)} / 4</span>
                                                    {attempt.has_detailed_report && (
                                                        <span className="inline-flex w-fit px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                                            Report ready
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-2"
                                                    onClick={() => {
                                                        setSelectedAttempt(attempt)
                                                        setIsModalOpen(true)
                                                    }}
                                                >
                                                    <Users size={14} />
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && !error && attempts.length > 0 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                            <span>Showing {filteredAttempts.length} of {attempts.length} attempts</span>
                        </div>
                    )}
                </div>

                {/* View Details Modal */}
                <AttemptDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    attempt={selectedAttempt}
                    assessment={assessmentDetails}
                    assessmentId={assessmentId}
                    onReportUpdated={(attemptId, meta) => {
                        setAttempts((prev) =>
                            prev.map((a) =>
                                a.id === attemptId
                                    ? {
                                          ...a,
                                          has_detailed_report: meta.has_detailed_report,
                                          detailed_report_generated_at: meta.generated_at,
                                          result_data: {
                                              ...(a.result_data || {}),
                                              detailed_report: meta.report,
                                          },
                                      }
                                    : a
                            )
                        )
                        setSelectedAttempt((prev: any) =>
                            prev?.id === attemptId
                                ? {
                                      ...prev,
                                      has_detailed_report: meta.has_detailed_report,
                                      detailed_report_generated_at: meta.generated_at,
                                      result_data: {
                                          ...(prev.result_data || {}),
                                          detailed_report: meta.report,
                                      },
                                  }
                                : prev
                        )
                    }}
                />
            </div>
        </AdminDashboardLayout>
    )
}

function AttemptDetailsModal({
    isOpen,
    onClose,
    attempt,
    assessment,
    assessmentId,
    onReportUpdated,
}: {
    isOpen: boolean
    onClose: () => void
    attempt: any
    assessment: any
    assessmentId: string
    onReportUpdated?: (
        attemptId: string,
        meta: {
            has_detailed_report: boolean
            generated_at?: string | null
            report?: {
                generated_at?: string | null
                model?: string | null
                summary?: string | null
                strengths?: string[]
                weaknesses?: string[]
                enhancement_areas?: string[]
            }
        }
    ) => void
}) {
    const [proctoring, setProctoring] = useState<any>(null)
    const [loadingProctoring, setLoadingProctoring] = useState(false)
    const [reportPreview, setReportPreview] = useState<{
        generated_at?: string | null
        model?: string | null
        summary?: string | null
        strengths?: string[]
        weaknesses?: string[]
        enhancement_areas?: string[]
    } | null>(null)
    const [generatingReport, setGeneratingReport] = useState(false)
    const [downloadingReport, setDownloadingReport] = useState(false)
    const [reportError, setReportError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen || !attempt?.id) {
            setProctoring(null)
            setReportPreview(null)
            setReportError(null)
            return
        }

        const stored = attempt.result_data?.detailed_report
        if (attempt.has_detailed_report || stored?.summary) {
            setReportPreview(stored || null)
        } else {
            setReportPreview(null)
        }

        const load = async () => {
            setLoadingProctoring(true)
            try {
                const data = await apiClient.get(
                    `/admin/assessments/${assessmentId}/attempts/${attempt.id}/proctoring-snapshots`
                )
                setProctoring(data)
            } catch {
                setProctoring({
                    proctoring_snapshots: attempt.proctoring_snapshots,
                    proctoring_snapshot_1_url: attempt.proctoring_snapshot_1_url,
                    proctoring_snapshot_2_url: attempt.proctoring_snapshot_2_url,
                    proctoring_snapshot_3_url: attempt.proctoring_snapshot_3_url,
                    proctoring_snapshot_4_url: attempt.proctoring_snapshot_4_url,
                })
            } finally {
                setLoadingProctoring(false)
            }
        }

        void load()

        // Hydrate stored report preview if flag is set but result_data may omit nested brief
        if (attempt.has_detailed_report && !stored?.summary) {
            void (async () => {
                try {
                    const data = await apiClient.getAssessmentDetailedReport(assessmentId, attempt.id)
                    setReportPreview({
                        generated_at: data.generated_at,
                        model: data.model,
                        summary: data.summary,
                        strengths: data.strengths,
                        weaknesses: data.weaknesses,
                        enhancement_areas: data.enhancement_areas,
                    })
                } catch {
                    /* ignore — generate still available */
                }
            })()
        }
    }, [isOpen, attempt?.id, assessmentId])

    const handleGenerateReport = async () => {
        if (!attempt?.id) return
        setGeneratingReport(true)
        setReportError(null)
        try {
            const data = await apiClient.generateAssessmentDetailedReport(assessmentId, attempt.id)
            const report = {
                generated_at: data.generated_at,
                model: data.model,
                summary: data.summary,
                strengths: data.strengths || [],
                weaknesses: data.weaknesses || [],
                enhancement_areas: data.enhancement_areas || [],
            }
            setReportPreview(report)
            onReportUpdated?.(attempt.id, {
                has_detailed_report: true,
                generated_at: data.generated_at,
                report,
            })
        } catch (err: any) {
            const detail =
                err?.response?.data?.detail ||
                err?.message ||
                'Failed to generate detailed report'
            setReportError(typeof detail === 'string' ? detail : 'Failed to generate detailed report')
        } finally {
            setGeneratingReport(false)
        }
    }

    const handleDownloadReport = async () => {
        if (!attempt?.id) return
        setDownloadingReport(true)
        setReportError(null)
        try {
            const blob = await apiClient.downloadAssessmentDetailedReportPdf(assessmentId, attempt.id)
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            const safeName = (attempt.student_name || 'student').replace(/[^a-zA-Z0-9]/g, '_')
            link.href = url
            link.download = `${safeName}_detailed_report.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (err: any) {
            let message = 'Generate the detailed report first'
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text()
                    const parsed = JSON.parse(text)
                    if (parsed?.detail) message = parsed.detail
                } catch {
                    /* keep default */
                }
            } else if (err?.response?.data?.detail) {
                message = err.response.data.detail
            } else if (err?.message) {
                message = err.message
            }
            setReportError(message)
        } finally {
            setDownloadingReport(false)
        }
    }

    if (!attempt) return null

    const evaluated = isAttemptEvaluated(attempt)
    const totalMaxScore = getAttemptMaxScore(attempt, assessment)
    const passFail = getPassFailLabel(attempt, assessment)
    const rounds = normalizeAttemptRounds(attempt)
    const hasReport = Boolean(reportPreview?.summary || attempt.has_detailed_report)

    const photoSlots = buildProctoringSlots(
        proctoring?.proctoring_snapshots?.length
            ? proctoring.proctoring_snapshots
            : attempt.proctoring_snapshots,
        proctoring || attempt
    )

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${!isOpen && 'hidden'}`}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col mx-4">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Student Report: {attempt.student_name || attempt.student_id}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
                        <ArrowLeft size={20} className="rotate-180" /> {/* Using generic close icon logic or X */}
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50 dark:bg-gray-900/50">

                    {!evaluated && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-100">
                            <p className="font-semibold">Evaluation pending</p>
                            <p className="mt-1">
                                Results for this attempt are not available yet (status: {attempt.status}).
                                Scores appear here after the student submits on Disha.
                            </p>
                        </div>
                    )}

                    {/* Summary Card */}
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Overall Score</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {evaluated && typeof attempt.total_score === 'number'
                                    ? attempt.total_score.toFixed(1)
                                    : '—'}{' '}
                                <span className="text-lg text-gray-400 font-normal">
                                    / {totalMaxScore > 0 ? totalMaxScore : '—'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Percentage</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {formatAttemptPercentage(attempt)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${passFail === 'PASS' ? 'bg-blue-600 text-white' :
                                    passFail === 'FAIL' ? 'bg-red-500 text-white' :
                                    passFail === 'MALPRACTICE' ? 'bg-amber-500 text-white' :
                                        'bg-gray-200 text-gray-700'
                                }`}>
                                {formatPassFailDisplay(passFail)}
                            </span>
                            {passFail === 'MALPRACTICE' && formatDisqualificationReason(getDisqualificationReason(attempt)) && (
                                <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                                    Reason: {formatDisqualificationReason(getDisqualificationReason(attempt))}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Proctoring photos */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            Photos captured during assessment
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Identity verification snapshots — 4 photos per round
                            {assessment?.rounds?.length
                                ? ` (up to ${(assessment.rounds.length || 1) * 4} for this assessment)`
                                : ''}
                            . Remaining shots for a round are captured when that round is submitted.
                        </p>
                        {!loadingProctoring && photoSlots.every((s) => !s.url) && evaluated && (
                            <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                                No photos were stored for this attempt. The student must take a new exam with the webcam
                                enabled for the full duration. Older attempts completed before proctoring was fixed will
                                stay empty.
                            </p>
                        )}
                        {loadingProctoring ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {photoSlots.map((slot) =>
                                    slot.url ? (
                                        <a
                                            key={`${slot.round_number || 0}-${slot.index}-${slot.displayIndex}`}
                                            href={slot.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:ring-2 hover:ring-blue-500"
                                        >
                                            <img
                                                src={slot.url}
                                                alt={`Photo ${slot.displayIndex}`}
                                                className="w-full aspect-[4/3] object-cover"
                                            />
                                            <div className="p-2 text-xs text-gray-600 dark:text-gray-400">
                                                <p className="font-semibold">
                                                    {slot.round_number
                                                        ? `Round ${slot.round_number} · Shot ${slot.index}`
                                                        : `Photo ${slot.displayIndex}`}
                                                </p>
                                                {slot.captured_at && (
                                                    <p>{new Date(slot.captured_at).toLocaleString()}</p>
                                                )}
                                            </div>
                                        </a>
                                    ) : (
                                        <div
                                            key={`empty-${slot.displayIndex}`}
                                            className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center aspect-[4/3] p-3 text-center bg-gray-50 dark:bg-gray-900/40"
                                        >
                                            <p className="text-sm font-medium text-gray-500">
                                                Photo {slot.displayIndex}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">Not captured</p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Round-wise Breakdown */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Round-wise Scores</h3>

                        {rounds.length > 0 ? rounds.map((round: any, idx: number) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                {/* Round Header */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        Round {round.round_number}: {round.round_name}
                                    </h4>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                            {typeof round.score === 'number' ? round.score.toFixed(1) : '—'}
                                            {' / '}
                                            {typeof round.total_score === 'number'
                                                ? round.total_score.toFixed(1)
                                                : userEstimateRoundTotal(round)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {typeof round.percentage === 'number'
                                                ? `${round.percentage.toFixed(1)}%`
                                                : '—'}
                                        </div>
                                    </div>
                                </div>

                                {/* Questions List */}
                                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {round.questions?.map((q: any, qIdx: number) => (
                                        <div key={qIdx} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            {/* Question Header */}
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <div className="flex-1">
                                                    <span className="text-gray-400 font-medium text-sm block mb-1">Q{qIdx + 1}:</span>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-base leading-relaxed">
                                                        {q.question_text}
                                                    </p>
                                                </div>
                                                <span className={`shrink-0 flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold shadow-sm ${q.score > 0 ? 'bg-blue-600 text-white' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {q.score > 0 ? (
                                                        <span className="flex items-center gap-1">
                                                            {q.score}/{q.max_score || 1}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            {q.score}/{q.max_score || 1}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Answer & Feedback Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Student Answer */}
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                                                    <p className="text-xs text-gray-500 font-semibold mb-2">Student Answer:</p>
                                                    <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap font-mono text-sm">
                                                        {formatStudentAnswerDisplay(q.student_answer, q.question_type)}
                                                    </p>
                                                </div>

                                                {/* Feedback */}
                                                <div className={`p-4 rounded-lg border ${q.score > 0
                                                    ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50'
                                                    : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800/50'
                                                    }`}>
                                                    <p className={`text-xs font-semibold mb-2 ${q.score > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                                                        }`}>Feedback:</p>
                                                    <p className={`text-sm font-medium ${q.score > 0 ? 'text-blue-800 dark:text-blue-300' : 'text-red-800 dark:text-red-300'
                                                        }`}>
                                                        {q.feedback || (q.score > 0 ? 'Correct (+1 points)' : 'Incorrect attempt')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500">
                                    {evaluated
                                        ? 'No detailed round data available for this attempt.'
                                        : 'Round-wise breakdown will appear after the student submits the exam.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* AI detailed report preview (after Generate) */}
                    {evaluated && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Brain className="h-5 w-5 text-blue-600" />
                                        Detailed analysis report
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Generate a Cohere brief (strengths, weaknesses, enhancement areas), then download the PDF.
                                    </p>
                                </div>
                                {hasReport && (
                                    <span className="shrink-0 px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                        Ready
                                    </span>
                                )}
                            </div>

                            {reportError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-800 dark:text-red-200">
                                    {reportError}
                                </div>
                            )}

                            {reportPreview?.summary ? (
                                <div className="space-y-3 text-sm">
                                    {reportPreview.generated_at && (
                                        <p className="text-xs text-gray-500">
                                            Generated {new Date(reportPreview.generated_at).toLocaleString()}
                                            {reportPreview.model ? ` · ${reportPreview.model}` : ''}
                                        </p>
                                    )}
                                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                        {reportPreview.summary}
                                    </p>
                                    {!!reportPreview.strengths?.length && (
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white mb-1">Strengths</p>
                                            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                                                {reportPreview.strengths.map((s, i) => (
                                                    <li key={`s-${i}`}>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {!!reportPreview.weaknesses?.length && (
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white mb-1">Weaknesses</p>
                                            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                                                {reportPreview.weaknesses.map((s, i) => (
                                                    <li key={`w-${i}`}>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {!!reportPreview.enhancement_areas?.length && (
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white mb-1">Where to enhance</p>
                                            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                                                {reportPreview.enhancement_areas.map((s, i) => (
                                                    <li key={`e-${i}`}>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No detailed report yet. Click Generate Detailed Report to create one.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-wrap items-center justify-end gap-2">
                    {evaluated && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => void handleGenerateReport()}
                                disabled={generatingReport || downloadingReport}
                                className="gap-2"
                            >
                                {generatingReport ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Brain className="h-4 w-4" />
                                )}
                                {hasReport ? 'Regenerate Report' : 'Generate Detailed Report'}
                            </Button>
                            <Button
                                onClick={() => void handleDownloadReport()}
                                disabled={!hasReport || generatingReport || downloadingReport}
                                className="gap-2"
                            >
                                {downloadingReport ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                Download Detailed PDF
                            </Button>
                        </>
                    )}
                    <Button variant="outline" onClick={onClose}>Close Report</Button>
                </div>
            </div>
        </div>
    )
}

function formatStudentAnswerDisplay(answer: unknown, questionType?: string): string {
    if (answer == null || answer === '') return '-'
    if (typeof answer === 'string' || typeof answer === 'number' || typeof answer === 'boolean') {
        return String(answer)
    }
    if (typeof answer === 'object') {
        const obj = answer as Record<string, unknown>
        const isCoding =
            String(questionType || '').toLowerCase() === 'coding' ||
            'source_code' in obj ||
            ('language' in obj && 'source_code' in obj)
        if (isCoding) {
            const lang = obj.language != null ? String(obj.language) : 'unknown'
            const code = obj.source_code != null ? String(obj.source_code) : ''
            if (!code.trim()) return `Language: ${lang}\n(no source code saved)`
            const preview =
                code.length > 2000 ? `${code.slice(0, 2000)}\n… (truncated)` : code
            return `Language: ${lang}\n\n${preview}`
        }
        try {
            return JSON.stringify(answer, null, 2)
        } catch {
            return '-'
        }
    }
    return '-'
}

function userEstimateRoundTotal(round: any) {
    if (typeof round.total_score === 'number') return round.total_score.toFixed(1)
    if (typeof round.max === 'number') return round.max.toFixed(1)
    if (round.questions && Array.isArray(round.questions) && round.questions.length > 0) {
        return round.questions.reduce((acc: number, q: any) => acc + (q.max_score || 1), 0)
    }
    if (typeof round.percentage === 'number' && round.percentage > 0 && round.score != null) {
        return Math.round(round.score / (round.percentage / 100))
    }
    return '—'
}
