"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Upload,
    X,
    Save,
    Eye,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface EventFormData {
    title: string
    description: string
    event_type: string
    event_date: string
    event_end_date: string
    registration_start_date: string
    registration_end_date: string
    place: string
    map_location: string
    venue_address: string
    max_participants: number
    registration_fee: number
    requires_approval: boolean
    contact_email: string
    contact_phone: string
    website_url: string
    tags: string[]
    university_ids: string[]
    photo_url?: string
    document_url?: string
}

const eventTypes = [
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'celebration', label: 'Celebration' },
    { value: 'pull_campus', label: 'Pull Campus' },
    { value: 'achievement', label: 'Achievement' }
]

const initialFormData: EventFormData = {
    title: '',
    description: '',
    event_type: '',
    event_date: '',
    event_end_date: '',
    registration_start_date: '',
    registration_end_date: '',
    place: '',
    map_location: '',
    venue_address: '',
    max_participants: 100,
    registration_fee: 0,
    requires_approval: false,
    contact_email: '',
    contact_phone: '',
    website_url: '',
    tags: [],
    university_ids: []
}

export function EventCreateForm() {
    const router = useRouter()
    const [formData, setFormData] = useState<EventFormData>(initialFormData)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [tagInput, setTagInput] = useState('')
    const [uploadedFiles, setUploadedFiles] = useState<{
        photo?: File
        document?: File
    }>({})

    const handleInputChange = (field: keyof EventFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleTagAdd = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }))
            setTagInput('')
        }
    }

    const handleTagRemove = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    const handleFileUpload = (type: 'photo' | 'document', file: File) => {
        setUploadedFiles(prev => ({ ...prev, [type]: file }))
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) newErrors.title = 'Event title is required'
        if (!formData.description.trim()) newErrors.description = 'Event description is required'
        if (!formData.event_type) newErrors.event_type = 'Event type is required'
        if (!formData.event_date) newErrors.event_date = 'Event date is required'
        if (!formData.event_end_date) newErrors.event_end_date = 'Event end date is required'
        if (!formData.place.trim()) newErrors.place = 'Event location is required'
        if (!formData.contact_email.trim()) newErrors.contact_email = 'Contact email is required'
        if (!formData.contact_phone.trim()) newErrors.contact_phone = 'Contact phone is required'

        // Date validations
        if (formData.event_date && formData.event_end_date) {
            if (new Date(formData.event_end_date) <= new Date(formData.event_date)) {
                newErrors.event_end_date = 'End date must be after start date'
            }
        }

        if (formData.registration_start_date && formData.registration_end_date) {
            if (new Date(formData.registration_end_date) <= new Date(formData.registration_start_date)) {
                newErrors.registration_end_date = 'Registration end date must be after start date'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)
        try {
            // TODO: Implement API call to create event
            console.log('Creating event:', formData)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Redirect to events list
            router.push('/dashboard/admin/events')
        } catch (error) {
            console.error('Error creating event:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePreview = () => {
        // TODO: Implement preview functionality
        console.log('Preview event:', formData)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Create New Event
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Fill in the details below to create a new event
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-primary-600" />
                            <span>Basic Information</span>
                        </CardTitle>
                        <CardDescription>
                            Provide the essential details about your event
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event Title *
                                </label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Enter event title"
                                    className={cn(errors.title && "border-red-500")}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event Type *
                                </label>
                                <Select
                                    value={formData.event_type}
                                    onValueChange={(value) => handleInputChange('event_type', value)}
                                >
                                    <SelectTrigger className={cn(errors.event_type && "border-red-500")}>
                                        <SelectValue placeholder="Select event type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {eventTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.event_type && (
                                    <p className="text-red-500 text-sm mt-1">{errors.event_type}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description *
                            </label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe your event in detail"
                                rows={4}
                                className={cn(errors.description && "border-red-500")}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(tag)}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add a tag"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                                />
                                <Button type="button" onClick={handleTagAdd} variant="outline">
                                    Add
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Date & Time */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-primary-600" />
                            <span>Date & Time</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event Start Date *
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={formData.event_date}
                                    onChange={(e) => handleInputChange('event_date', e.target.value)}
                                    className={cn(errors.event_date && "border-red-500")}
                                />
                                {errors.event_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.event_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event End Date *
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={formData.event_end_date}
                                    onChange={(e) => handleInputChange('event_end_date', e.target.value)}
                                    className={cn(errors.event_end_date && "border-red-500")}
                                />
                                {errors.event_end_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.event_end_date}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Registration Start Date
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={formData.registration_start_date}
                                    onChange={(e) => handleInputChange('registration_start_date', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Registration End Date
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={formData.registration_end_date}
                                    onChange={(e) => handleInputChange('registration_end_date', e.target.value)}
                                    className={cn(errors.registration_end_date && "border-red-500")}
                                />
                                {errors.registration_end_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.registration_end_date}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-primary-600" />
                            <span>Location</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Venue *
                            </label>
                            <Input
                                value={formData.place}
                                onChange={(e) => handleInputChange('place', e.target.value)}
                                placeholder="Enter venue name"
                                className={cn(errors.place && "border-red-500")}
                            />
                            {errors.place && (
                                <p className="text-red-500 text-sm mt-1">{errors.place}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Address
                            </label>
                            <Textarea
                                value={formData.venue_address}
                                onChange={(e) => handleInputChange('venue_address', e.target.value)}
                                placeholder="Enter full address"
                                rows={2}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Map Location
                            </label>
                            <Input
                                value={formData.map_location}
                                onChange={(e) => handleInputChange('map_location', e.target.value)}
                                placeholder="Google Maps URL or coordinates"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Registration Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-primary-600" />
                            <span>Registration Details</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Max Participants
                                </label>
                                <Input
                                    type="number"
                                    value={formData.max_participants}
                                    onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value) || 0)}
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Registration Fee (₹)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.registration_fee}
                                    onChange={(e) => handleInputChange('registration_fee', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="requires_approval"
                                checked={formData.requires_approval}
                                onChange={(e) => handleInputChange('requires_approval', e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="requires_approval" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Requires approval for registration
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-primary-600" />
                            <span>Contact Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contact Email *
                                </label>
                                <Input
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                    placeholder="contact@example.com"
                                    className={cn(errors.contact_email && "border-red-500")}
                                />
                                {errors.contact_email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contact Phone *
                                </label>
                                <Input
                                    type="tel"
                                    value={formData.contact_phone}
                                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                                    placeholder="+91 9876543210"
                                    className={cn(errors.contact_phone && "border-red-500")}
                                />
                                {errors.contact_phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Website URL
                            </label>
                            <Input
                                type="url"
                                value={formData.website_url}
                                onChange={(e) => handleInputChange('website_url', e.target.value)}
                                placeholder="https://example.com"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* File Uploads */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Upload className="w-5 h-5 text-primary-600" />
                            <span>Files & Media</span>
                        </CardTitle>
                        <CardDescription>
                            Upload event photo and documents (optional)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event Photo
                                </label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Upload event photo (JPG, PNG - Max 10MB)
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload('photo', e.target.files[0])}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        Choose File
                                    </label>
                                </div>
                                {uploadedFiles.photo && (
                                    <p className="text-sm text-green-600 mt-2">
                                        ✓ {uploadedFiles.photo.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event Document
                                </label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Upload event document (PDF - Max 10MB)
                                    </p>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload('document', e.target.files[0])}
                                        className="hidden"
                                        id="document-upload"
                                    />
                                    <label
                                        htmlFor="document-upload"
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        Choose File
                                    </label>
                                </div>
                                {uploadedFiles.document && (
                                    <p className="text-sm text-green-600 mt-2">
                                        ✓ {uploadedFiles.document.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePreview}
                        className="flex items-center space-x-2"
                    >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        className="flex items-center space-x-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>Create Event</span>
                    </Button>
                </div>
            </form>
        </div>
    )
}
