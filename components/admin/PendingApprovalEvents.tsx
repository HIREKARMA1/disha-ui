"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    AlertCircle,
    User,
    Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface PendingEvent {
    id: string
    title: string
    description: string
    event_type: string
    event_date: string
    event_end_date: string
    place: string
    max_participants: number
    registration_fee: number
    contact_email: string
    contact_phone: string
    created_at: string
    created_by: {
        id: string
        name: string
        email: string
        user_type: string
    }
    university: {
        id: string
        name: string
    }
    tags: string[]
    photo_url?: string
    document_url?: string
}

const mockPendingEvents: PendingEvent[] = [
    {
        id: '1',
        title: 'AI Workshop Series',
        description: 'Hands-on workshop on artificial intelligence and machine learning for students',
        event_type: 'workshop',
        event_date: '2024-03-20T10:00:00Z',
        event_end_date: '2024-03-20T16:00:00Z',
        place: 'Tech Hub, Mumbai',
        max_participants: 50,
        registration_fee: 500,
        contact_email: 'workshop@techhub.com',
        contact_phone: '+91 9876543210',
        created_at: '2024-01-20T14:30:00Z',
        created_by: {
            id: 'uni-1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah@techhub.com',
            user_type: 'university'
        },
        university: {
            id: 'uni-1',
            name: 'Tech Hub University'
        },
        tags: ['AI', 'ML', 'workshop', 'technology']
    },
    {
        id: '2',
        title: 'Startup Pitch Competition',
        description: 'Annual startup pitch competition for aspiring entrepreneurs',
        event_type: 'seminar',
        event_date: '2024-04-15T09:00:00Z',
        event_end_date: '2024-04-15T18:00:00Z',
        place: 'Innovation Center, Bangalore',
        max_participants: 200,
        registration_fee: 0,
        contact_email: 'pitch@innovation.com',
        contact_phone: '+91 9876543211',
        created_at: '2024-01-18T10:15:00Z',
        created_by: {
            id: 'uni-2',
            name: 'Prof. Michael Chen',
            email: 'michael@innovation.com',
            user_type: 'university'
        },
        university: {
            id: 'uni-2',
            name: 'Innovation University'
        },
        tags: ['startup', 'entrepreneurship', 'pitch', 'competition']
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

export function PendingApprovalEvents() {
    const [events, setEvents] = useState<PendingEvent[]>(mockPendingEvents)
    const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [loading, setLoading] = useState(false)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleApprove = async (eventId: string) => {
        setLoading(true)
        try {
            // TODO: Implement API call to approve event
            console.log('Approving event:', eventId)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Remove from pending list
            setEvents(prev => prev.filter(event => event.id !== eventId))
            setSelectedEvent(null)
        } catch (error) {
            console.error('Error approving event:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async (eventId: string) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection')
            return
        }

        setLoading(true)
        try {
            // TODO: Implement API call to reject event
            console.log('Rejecting event:', eventId, 'Reason:', rejectionReason)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Remove from pending list
            setEvents(prev => prev.filter(event => event.id !== eventId))
            setSelectedEvent(null)
            setRejectionReason('')
        } catch (error) {
            console.error('Error rejecting event:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Pending Approval
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review and approve events submitted by universities
                    </p>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                    {events.length} Pending
                </Badge>
            </div>

            {/* Events List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
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
                                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                        Pending
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                        <span>Max {event.max_participants} participants</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <DollarSign className="w-4 h-4" />
                                        <span>₹{event.registration_fee} registration fee</span>
                                    </div>
                                </div>

                                {/* Event Type */}
                                <div>
                                    <Badge variant="secondary">
                                        {eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]}
                                    </Badge>
                                </div>

                                {/* Created By */}
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                    <User className="w-4 h-4" />
                                    <span>Created by {event.created_by.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Building2 className="w-4 h-4" />
                                    <span>{event.university.name}</span>
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedEvent(event)}
                                        className="flex-1"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Review
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(event.id)}
                                        loading={loading}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {events.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            All caught up!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            There are no pending events to review at the moment.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Review Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Review Event
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedEvent(null)}
                                >
                                    <XCircle className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Event Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {selectedEvent.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {selectedEvent.description}
                                    </p>
                                </div>

                                {/* Event Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Event Type
                                        </label>
                                        <Badge variant="secondary">
                                            {eventTypeLabels[selectedEvent.event_type as keyof typeof eventTypeLabels]}
                                        </Badge>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Event Date
                                        </label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(selectedEvent.event_date)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Location
                                        </label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedEvent.place}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Max Participants
                                        </label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedEvent.max_participants}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                                        Contact Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Email
                                            </label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedEvent.contact_email}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Phone
                                            </label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedEvent.contact_phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Created By */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                                        Submitted By
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Name:</strong> {selectedEvent.created_by.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Email:</strong> {selectedEvent.created_by.email}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>University:</strong> {selectedEvent.university.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Rejection Reason */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Rejection Reason (if rejecting)
                                    </label>
                                    <Textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Provide a reason for rejection..."
                                        rows={3}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedEvent(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleReject(selectedEvent.id)}
                                        loading={loading}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleApprove(selectedEvent.id)}
                                        loading={loading}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
