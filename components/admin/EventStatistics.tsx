"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar,
    Users,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
    MapPin,
    DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EventStats {
    total_events: number
    active_events: number
    past_events: number
    pending_approval: number
    total_registrations: number
    events_by_type: Record<string, number>
    events_by_status: Record<string, number>
    registration_trends: Array<{
        month: string
        registrations: number
    }>
    top_events: Array<{
        id: string
        title: string
        registrations: number
    }>
}

const mockStats: EventStats = {
    total_events: 150,
    active_events: 45,
    past_events: 105,
    pending_approval: 8,
    total_registrations: 2500,
    events_by_type: {
        conference: 25,
        workshop: 40,
        seminar: 35,
        celebration: 20,
        pull_campus: 15,
        achievement: 15
    },
    events_by_status: {
        approved: 120,
        pending_approval: 8,
        rejected: 2
    },
    registration_trends: [
        { month: 'Jan', registrations: 120 },
        { month: 'Feb', registrations: 180 },
        { month: 'Mar', registrations: 250 },
        { month: 'Apr', registrations: 320 },
        { month: 'May', registrations: 280 },
        { month: 'Jun', registrations: 350 }
    ],
    top_events: [
        { id: '1', title: 'Tech Conference 2024', registrations: 234 },
        { id: '2', title: 'Career Fair 2024', registrations: 567 },
        { id: '3', title: 'AI Workshop Series', registrations: 89 },
        { id: '4', title: 'Startup Summit', registrations: 156 },
        { id: '5', title: 'Design Thinking Workshop', registrations: 78 }
    ]
}

const eventTypeLabels = {
    conference: 'Conference',
    workshop: 'Workshop',
    seminar: 'Seminar',
    celebration: 'Celebration',
    pull_campus: 'Pull Campus',
    achievement: 'Achievement'
}

const statusLabels = {
    approved: 'Approved',
    pending_approval: 'Pending Approval',
    rejected: 'Rejected'
}

export function EventStatistics() {
    const [stats, setStats] = useState<EventStats>(mockStats)
    const [timeRange, setTimeRange] = useState('6months')
    const [loading, setLoading] = useState(false)

    const statCards = [
        {
            title: 'Total Events',
            value: stats.total_events,
            icon: Calendar,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            change: '+12%',
            changeType: 'positive' as const
        },
        {
            title: 'Active Events',
            value: stats.active_events,
            icon: Activity,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            change: '+8%',
            changeType: 'positive' as const
        },
        {
            title: 'Total Registrations',
            value: stats.total_registrations,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            change: '+25%',
            changeType: 'positive' as const
        },
        {
            title: 'Pending Approval',
            value: stats.pending_approval,
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            change: '-3',
            changeType: 'negative' as const
        }
    ]

    const getEventTypeColor = (type: string) => {
        const colors = {
            conference: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            workshop: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            seminar: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            celebration: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            pull_campus: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
            achievement: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
        }
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }

    const getStatusColor = (status: string) => {
        const colors = {
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Event Statistics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Comprehensive analytics and insights for event management
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1month">Last Month</SelectItem>
                            <SelectItem value="3months">Last 3 Months</SelectItem>
                            <SelectItem value="6months">Last 6 Months</SelectItem>
                            <SelectItem value="1year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {stat.title}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {stat.value.toLocaleString()}
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <span className={`text-sm font-medium ${stat.changeType === 'positive'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {stat.change}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                                vs last period
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Events by Type */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <PieChart className="w-5 h-5 text-primary-600" />
                            <span>Events by Type</span>
                        </CardTitle>
                        <CardDescription>
                            Distribution of events across different categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(stats.events_by_type).map(([type, count]) => {
                                const percentage = Math.round((count / stats.total_events) * 100)
                                return (
                                    <div key={type} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Badge className={getEventTypeColor(type)}>
                                                {eventTypeLabels[type as keyof typeof eventTypeLabels]}
                                            </Badge>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {count} events
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-primary-500 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                                                {percentage}%
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Events by Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-primary-600" />
                            <span>Events by Status</span>
                        </CardTitle>
                        <CardDescription>
                            Current approval status of all events
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(stats.events_by_status).map(([status, count]) => {
                                const percentage = Math.round((count / stats.total_events) * 100)
                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Badge className={getStatusColor(status)}>
                                                {statusLabels[status as keyof typeof statusLabels]}
                                            </Badge>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {count} events
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-primary-500 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                                                {percentage}%
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Registration Trends */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                        <span>Registration Trends</span>
                    </CardTitle>
                    <CardDescription>
                        Monthly registration patterns over time
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {stats.registration_trends.map((trend, index) => {
                            const maxRegistrations = Math.max(...stats.registration_trends.map(t => t.registrations))
                            const height = (trend.registrations / maxRegistrations) * 200

                            return (
                                <div key={trend.month} className="flex flex-col items-center space-y-2 flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {trend.registrations}
                                    </div>
                                    <div
                                        className="w-full bg-primary-500 rounded-t transition-all duration-500 hover:bg-primary-600"
                                        style={{ height: `${height}px` }}
                                    />
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {trend.month}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Top Events */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-primary-600" />
                        <span>Top Events by Registration</span>
                    </CardTitle>
                    <CardDescription>
                        Most popular events based on registration count
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.top_events.map((event, index) => (
                            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {event.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {event.registrations} registrations
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="secondary">
                                        #{index + 1}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
