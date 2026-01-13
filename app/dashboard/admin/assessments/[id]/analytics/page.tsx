"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Loader2, Search, Filter, ArrowLeft, Download } from 'lucide-react'
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
        const total = attempts.length
        if (total === 0) return { passRate: 0, avgScore: 0 }

        const passed = attempts.filter(a => a.status === 'PASSED').length
        const totalScore = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0)

        return {
            passRate: ((passed / total) * 100).toFixed(1),
            avgScore: (totalScore / total).toFixed(1)
        }
    }

    const stats = calculateStats()

    return (
        <AdminDashboardLayout>
            <div className="space-y-6 pb-10">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {assessmentDetails?.assessment_name || 'Assessment'} Analytics
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Detailed insights and student performance records
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {/* Placeholder for future export functionality */}
                            {/* <Button variant="outline" className="gap-2">
                                <Download className="w-4 h-4" />
                                Export CSV
                            </Button> */}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">Total Attempts</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{attempts.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{stats.passRate}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">Average Score</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgScore}%</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Student Name or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-48"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PASSED">Passed</option>
                            <option value="FAILED">Failed</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
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
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Percentage</th>
                                        <th className="px-6 py-4">Submitted At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAttempts.map((attempt) => (
                                        <tr key={attempt.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{attempt.student_name || "Unknown"}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{attempt.student_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(attempt.status)}`}>
                                                    {attempt.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-mono">
                                                {attempt.total_score?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-mono">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${attempt.percentage >= 60 ? 'bg-green-500' : attempt.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${attempt.percentage}%` }}
                                                        />
                                                    </div>
                                                    <span>{attempt.percentage?.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
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
