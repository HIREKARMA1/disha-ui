"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Loader2, Search, Filter, ArrowLeft, Download, Brain, Target, Users, Calendar, Clock, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'

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

        const total = attempts.length
        if (total === 0) return { passRate: 0, avgScore: 0 }

        const passed = attempts.filter(a => a.status === 'PASSED').length
        const totalScore = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0)
        const avgPct = (totalScore / total).toFixed(1)

        // If 'passed' count is 0 but we have valid attempts, the user might want to see the Average Performance 
        // in the "Pass Rate" slot if they are confusing terms, OR we can stick to strict "Pass Rate".
        // Given the request "passing rate should show the 35 percent" (which is the avg score),
        // we will ensure the Average Score card shows it clearly, but for Pass Rate, 
        // if the status is strictly relied upon, 0 is correct for FAIL. 
        // However, to be helpful, if N=1, Pass Rate = 0 is discouraging/confusing if they just want "Score".
        // Let's keep Pass Rate strict but ensure Average Score is highlighted.

        return {
            passRate: ((passed / total) * 100).toFixed(1),
            avgScore: avgPct
        }
    }

    const stats = calculateStats()

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
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
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
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Percentage</th>
                                        <th className="px-6 py-4">Submitted At</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredAttempts.map((attempt) => (
                                        <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                                            {attempt.student_name ? attempt.student_name.substring(0, 2).toUpperCase() : 'ST'}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {attempt.student_name || "Unknown"}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                            {attempt.student_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${attempt.status === 'PASSED' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                    attempt.status === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                                        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                    }`}>
                                                    {attempt.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                                                {attempt.total_score?.toFixed(1) ?? '-'}
                                                <span className="text-gray-400 text-xs ml-1">
                                                    / {attempt.percentage > 0 ? (attempt.total_score / (attempt.percentage / 100)).toFixed(0) : '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${attempt.percentage >= 60 ? 'bg-green-500' : attempt.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${attempt.percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{attempt.percentage?.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && !error && attempts.length > 0 && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex justify-between">
                            <span>Showing {filteredAttempts.length} of {attempts.length} attempts</span>
                        </div>
                    )}
                </div>
            </div>
        </AdminDashboardLayout>
    )
}
