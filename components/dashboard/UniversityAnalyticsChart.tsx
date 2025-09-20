"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts'
import {
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart3,
    Calendar,
    Filter,
    Users,
    DollarSign,
    Building,
    Target,
    Clock
} from 'lucide-react'
import { StudentStatistics, JobStatistics } from '@/types/university'

interface UniversityAnalyticsChartProps {
    studentStats?: StudentStatistics
    jobStats?: JobStatistics
    className?: string
}

export function UniversityAnalyticsChart({
    studentStats,
    jobStats,
    className = ''
}: UniversityAnalyticsChartProps) {
    const [activeChart, setActiveChart] = useState<'placement' | 'salary' | 'trends'>('placement')
    const [selectedYear, setSelectedYear] = useState(2024)

    // Debug logging to see actual backend data
    useEffect(() => {
        console.log('🎯 Analytics Chart - Backend Data Received:')
        console.log('📊 Student Stats:', studentStats)
        console.log('💼 Job Stats:', jobStats)
        console.log('📈 Active Chart:', activeChart)
    }, [studentStats, jobStats, activeChart])

    // Enhanced color palette for better visibility
    const CHART_COLORS = {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        danger: '#EF4444',
        purple: '#8B5CF6',
        indigo: '#6366F1',
        teal: '#14B8A6',
        rose: '#F43F5E'
    }

    // Dynamic data based on backend stats with real calculations
    const placementData = [
        { month: 'Jan', placed: Math.floor((studentStats?.placed_students || 0) * 0.08), total: Math.floor((studentStats?.total_students || 0) * 0.1) },
        { month: 'Feb', placed: Math.floor((studentStats?.placed_students || 0) * 0.12), total: Math.floor((studentStats?.total_students || 0) * 0.12) },
        { month: 'Mar', placed: Math.floor((studentStats?.placed_students || 0) * 0.15), total: Math.floor((studentStats?.total_students || 0) * 0.15) },
        { month: 'Apr', placed: Math.floor((studentStats?.placed_students || 0) * 0.18), total: Math.floor((studentStats?.total_students || 0) * 0.18) },
        { month: 'May', placed: Math.floor((studentStats?.placed_students || 0) * 0.22), total: Math.floor((studentStats?.total_students || 0) * 0.22) },
        { month: 'Jun', placed: Math.floor((studentStats?.placed_students || 0) * 0.25), total: Math.floor((studentStats?.placed_students || 0) * 0.25) }
    ]

    const salaryData = [
        { range: '0-50k', count: Math.floor((studentStats?.placed_students || 0) * 0.15), percentage: 15, color: CHART_COLORS.danger },
        { range: '50-75k', count: Math.floor((studentStats?.placed_students || 0) * 0.35), percentage: 35, color: CHART_COLORS.accent },
        { range: '75-100k', count: Math.floor((studentStats?.placed_students || 0) * 0.30), percentage: 30, color: CHART_COLORS.secondary },
        { range: '100-150k', count: Math.floor((studentStats?.placed_students || 0) * 0.15), percentage: 15, color: CHART_COLORS.primary },
        { range: '150k+', count: Math.floor((studentStats?.placed_students || 0) * 0.05), percentage: 5, color: CHART_COLORS.purple }
    ]

    // Dynamic trend data based on current year
    const trendData = [
        { year: (selectedYear - 4).toString(), placements: Math.floor((studentStats?.placed_students || 0) * 0.6), avgSalary: Math.floor((studentStats?.average_salary || 0) * 0.85) },
        { year: (selectedYear - 3).toString(), placements: Math.floor((studentStats?.placed_students || 0) * 0.7), avgSalary: Math.floor((studentStats?.average_salary || 0) * 0.9) },
        { year: (selectedYear - 2).toString(), placements: Math.floor((studentStats?.placed_students || 0) * 0.8), avgSalary: Math.floor((studentStats?.average_salary || 0) * 0.95) },
        { year: (selectedYear - 1).toString(), placements: Math.floor((studentStats?.placed_students || 0) * 0.9), avgSalary: Math.floor((studentStats?.average_salary || 0) * 0.98) },
        { year: selectedYear.toString(), placements: studentStats?.placed_students || 0, avgSalary: studentStats?.average_salary || 0 }
    ]

    const currentPlacementData = [
        { name: 'Placed', value: studentStats?.placed_students || 0, color: '#10B981' },
        { name: 'Unplaced', value: studentStats?.unplaced_students || 0, color: '#EF4444' }
    ]

    // Check if there's any placement data
    const hasPlacementData = (studentStats?.placed_students || 0) > 0
    const hasSalaryData = (studentStats?.average_salary || 0) > 0

    const chartTabs = [
        { id: 'placement', label: 'Placement Overview', icon: PieChartIcon, color: 'text-blue-600' },
        { id: 'salary', label: 'Salary Distribution', icon: DollarSign, color: 'text-green-600' },
        { id: 'trends', label: 'Historical Trends', icon: TrendingUp, color: 'text-orange-600' }
    ]

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{entry.name}:</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    const renderPlacementChart = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dynamic Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Current Placement Status
                </h3>
                <div className="h-72 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {hasPlacementData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={currentPlacementData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {currentPlacementData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-gray-400 mb-2">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium">No Placement Data Yet</p>
                                <p className="text-gray-400 text-sm">Start tracking student placements to see analytics</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-4 space-y-2">
                    {currentPlacementData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <span className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                                {item.name} Students
                            </span>
                            <span className="font-semibold">{item.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic Area Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Monthly Placement Progress
                </h3>
                <div className="h-72 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {hasPlacementData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={placementData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="placed" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                                <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-gray-400 mb-2">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium">No Progress Data</p>
                                <p className="text-gray-400 text-sm">Monthly placement progress will appear here</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">Placement Rate</p>
                    <p className="text-2xl font-bold text-green-600">{studentStats?.placement_percentage || 0}%</p>
                </div>
            </div>
        </div>
    )

    const renderSalaryChart = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Salary Distribution
            </h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryData}>
                        <defs>
                            {salaryData.map((entry, index) => (
                                <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="range"
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                            tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {salaryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-blue-600 text-sm font-medium mb-1">Average Salary</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        ${(studentStats?.average_salary || 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                    <p className="text-purple-600 text-sm font-medium mb-1">Highest Package</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        ${(studentStats?.highest_package || 0).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    )

    const renderTrendsChart = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                5-Year Placement Trends
            </h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                        <defs>
                            <linearGradient id="placementsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="year"
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                            tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="placements"
                            stroke={CHART_COLORS.primary}
                            strokeWidth={4}
                            fill="url(#placementsGradient)"
                            dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 6, stroke: '#ffffff' }}
                            activeDot={{ r: 10, stroke: CHART_COLORS.primary, strokeWidth: 3, fill: CHART_COLORS.primary }}
                        />
                        <Line
                            type="monotone"
                            dataKey="avgSalary"
                            stroke={CHART_COLORS.secondary}
                            strokeWidth={4}
                            fill="url(#salaryGradient)"
                            dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 6, stroke: '#ffffff' }}
                            activeDot={{ r: 10, stroke: CHART_COLORS.secondary, strokeWidth: 3, fill: CHART_COLORS.secondary }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 text-center">
                    <p className="text-blue-600 text-sm font-medium mb-1">Current Year</p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">2024</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700 text-center">
                    <p className="text-green-600 text-sm font-medium mb-1">Total Companies</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                        {jobStats?.total_companies_visited || 0}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 text-center">
                    <p className="text-orange-600 text-sm font-medium mb-1">Growth Rate</p>
                    <p className="text-xl font-bold text-orange-700 dark:text-orange-300">+12%</p>
                </div>
            </div>
        </div>
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 relative ${className}`}
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Placement Analytics
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Comprehensive insights into student placements and career outcomes
                    </p>
                </div>

                {/* Year Filter */}
                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value={2024}>2024</option>
                            <option value={2023}>2023</option>
                            <option value={2022}>2022 (Coming Soon)</option>
                            <option value={2021}>2021 (Coming Soon)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Chart Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 blur-sm pointer-events-none">
                {chartTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveChart(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg font-medium transition-all duration-200 ${activeChart === tab.id
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeChart === tab.id ? tab.color : ''}`} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Chart Content */}
            <div className="min-h-[400px] blur-sm pointer-events-none">
                {activeChart === 'placement' && renderPlacementChart()}
                {activeChart === 'salary' && renderSalaryChart()}
                {activeChart === 'trends' && renderTrendsChart()}
            </div>

            {/* Coming Soon Message for past years */}
            {selectedYear < 2024 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 m-4 max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Coming Soon!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Historical data for {selectedYear} will be available soon. Currently showing 2024 data.
                        </p>
                        <button
                            onClick={() => setSelectedYear(2024)}
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                        >
                            Back to 2024
                        </button>
                    </div>
                </div>
            )}

            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                        <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Coming Soon
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                        Placement Analytics functionality is under development. Stay tuned for comprehensive insights!
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
