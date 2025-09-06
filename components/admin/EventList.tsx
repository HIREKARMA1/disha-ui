"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    MoreVertical,
    Search,
    Filter,
    Plus,
    Eye,
    Edit,
    Trash2,
    Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Event {
    id: string
    title: string
    description: string
    event_type: string
    event_date: string
    event_end_date: string
    place: string
    max_participants: number
    current_participants: number
    registration_fee: number
    status: 'active' | 'inactive' | 'cancelled'
    approval_status: 'approved' | 'pending_approval' | 'rejected'
    created_at: string
    photo_url?: string
    tags: string[]
}

const mockEvents: Event[] = [
    {
        id: '1',
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring the latest innovations',
        event_type: 'conference',
        event_date: '2024-03-15T09:00:00Z',
        event_end_date: '2024-03-15T17:00:00Z',
        place: 'Convention Center, Bangalore',
        max_participants: 500,
        current_participants: 234,
        registration_fee: 1000,
        status: 'active',
        approval_status: 'approved',
        created_at: '2024-01-15T10:00:00Z',
        tags: ['technology', 'innovation', 'networking']
    },
    {
        id: '2',
        title: 'AI Workshop Series',
        description: 'Hands-on workshop on artificial intelligence and machine learning',
        event_type: 'workshop',
        event_date: '2024-03-20T10:00:00Z',
        event_end_date: '2024-03-20T16:00:00Z',
        place: 'Tech Hub, Mumbai',
        max_participants: 50,
        current_participants: 12,
        registration_fee: 500,
        status: 'active',
        approval_status: 'pending_approval',
        created_at: '2024-01-20T14:30:00Z',
        tags: ['AI', 'ML', 'workshop']
    },
    {
        id: '3',
        title: 'Career Fair 2024',
        description: 'Connect with top companies and explore career opportunities',
        event_type: 'seminar',
        event_date: '2024-04-10T09:00:00Z',
        event_end_date: '2024-04-10T18:00:00Z',
        place: 'Exhibition Center, Delhi',
        max_participants: 1000,
        current_participants: 567,
        registration_fee: 0,
        status: 'active',
        approval_status: 'approved',
        created_at: '2024-01-10T08:00:00Z',
        tags: ['career', 'jobs', 'networking']
    }
]

const eventTypeLabels = {
    conference: 'Conference',
    workshop: 'Workshop',
    seminar: 'Seminar',
    celebration: 'Celebration',
    pull_campus: 'Pull Campus',
    achievement: 'Achievement'
}

const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

const approvalStatusColors = {
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

export function EventList() {
    const [events, setEvents] = useState<Event[]>(mockEvents)
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [approvalFilter, setApprovalFilter] = useState<string>('all')

    useEffect(() => {
        let filtered = events

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.place.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(event => event.status === statusFilter)
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(event => event.event_type === typeFilter)
        }

        // Approval filter
        if (approvalFilter !== 'all') {
            filtered = filtered.filter(event => event.approval_status === approvalFilter)
        }

        setFilteredEvents(filtered)
    }, [events, searchTerm, statusFilter, typeFilter, approvalFilter])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getParticipantPercentage = (current: number, max: number) => {
        return Math.round((current / max) * 100)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Event Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage and monitor all events
                    </p>
                </div>
                <Link href="/dashboard/admin/events/create">
                    <Button className="flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Create Event</span>
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-primary-600" />
                        <span>Filters</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Type
                            </label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {Object.entries(eventTypeLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Approval
                            </label>
                            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Approval" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Approval</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="pending_approval">Pending</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg line-clamp-2">
                                            {event.title}
                                        </CardTitle>
                                        <CardDescription className="mt-1 line-clamp-2">
                                            {event.description}
                                        </CardDescription>
                                    </div>
                                    <div className="ml-2">
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Event Type and Status */}
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary">
                                        {eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]}
                                    </Badge>
                                    <div className="flex space-x-2">
                                        <Badge className={statusColors[event.status]}>
                                            {event.status}
                                        </Badge>
                                        <Badge className={approvalStatusColors[event.approval_status]}>
                                            {event.approval_status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Event Details */}
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(event.event_date)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4" />
                                        <span className="line-clamp-1">{event.place}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Users className="w-4 h-4" />
                                        <span>
                                            {event.current_participants} / {event.max_participants} participants
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <span>Registration Progress</span>
                                        <span>{getParticipantPercentage(event.current_participants, event.max_participants)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${getParticipantPercentage(event.current_participants, event.max_participants)}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Tags */}
                                {event.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {event.tags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {event.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{event.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex space-x-2 pt-2">
                                    <Link href={`/dashboard/admin/events/${event.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/admin/events/${event.id}/edit`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredEvents.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No events found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || approvalFilter !== 'all'
                                ? 'Try adjusting your filters to see more events.'
                                : 'Get started by creating your first event.'
                            }
                        </p>
                        {(!searchTerm && statusFilter === 'all' && typeFilter === 'all' && approvalFilter === 'all') && (
                            <Link href="/dashboard/admin/events/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Event
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
