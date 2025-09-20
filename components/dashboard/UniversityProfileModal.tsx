"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Star,
    Globe,
    FileText,
    X,
    CheckCircle,
    AlertCircle,
    Camera,
    Eye,
    EyeOff,
    ExternalLink,
    Download,
    Users,
    GraduationCap,
    Shield,
    Clock,
    BarChart3,
    Award,
    BookOpen,
    Printer,
    Share2,
    Copy,
    User,
    Zap,
    Trophy,
    TrendingUp,
    Shield as ShieldIcon,
    Globe as GlobeIcon
} from 'lucide-react'
import { UniversityListItem, UniversityProfile } from '@/types/university'
import { getInitials } from '@/lib/utils'

// Extended interface that combines UniversityListItem with comprehensive profile data
interface ExtendedUniversityProfile extends UniversityListItem {
    // Additional fields that might not be in UniversityListItem
    bio?: string
    contact_person_name?: string
    contact_designation?: string
    website_url?: string
    established_year?: number
    courses_offered?: string
    departments?: string
    programs_offered?: string
    total_faculty?: number
    placement_rate?: number
    average_package?: number
    top_recruiters?: string
    verification_date?: string
    email_verified?: boolean
    phone_verified?: boolean
    profile_picture?: string
    updated_at?: string
    last_login?: string
}

interface UniversityProfileModalProps {
    isOpen: boolean
    onClose: () => void
    university: UniversityListItem | null
    fullProfile?: UniversityProfile | null
    isLoading?: boolean
}

export function UniversityProfileModal({
    isOpen,
    onClose,
    university,
    fullProfile,
    isLoading = false
}: UniversityProfileModalProps) {
    const [activeTab, setActiveTab] = useState('basic')

    console.log('UniversityProfileModal rendered with:', { isOpen, university, fullProfile, isLoading })

    if (!isOpen || !university) {
        console.log('UniversityProfileModal: Not rendering - isOpen:', isOpen, 'university:', university)
        return null
    }

    // Safety check: ensure university has required properties
    if (!university.id || !university.university_name || !university.email) {
        console.error('UniversityProfileModal - Invalid university data:', university)
        return null
    }

    // Combine university data with full profile data if available
    const extendedUniversity: ExtendedUniversityProfile = {
        ...university,
        ...fullProfile,
        // Ensure we have the most up-to-date data
        email_verified: fullProfile?.email_verified ?? university.email_verified ?? false,
        phone_verified: fullProfile?.phone_verified ?? university.phone_verified ?? false,
        profile_picture: fullProfile?.profile_picture ?? university.profile_picture,
        bio: university.bio ?? fullProfile?.bio ?? '',
        contact_person_name: university.contact_person_name ?? fullProfile?.contact_person_name ?? '',
        contact_designation: university.contact_designation ?? fullProfile?.contact_designation ?? '',
        website_url: university.website_url ?? fullProfile?.website_url ?? '',
        established_year: university.established_year ?? fullProfile?.established_year,
        courses_offered: university.courses_offered ?? fullProfile?.courses_offered ?? '',
        departments: university.departments ?? fullProfile?.departments ?? '',
        programs_offered: university.programs_offered ?? fullProfile?.programs_offered ?? '',
        total_faculty: university.total_faculty ?? fullProfile?.total_faculty,
        placement_rate: university.placement_rate ?? fullProfile?.placement_rate,
        average_package: university.average_package ?? fullProfile?.average_package,
        top_recruiters: university.top_recruiters ?? fullProfile?.top_recruiters ?? '',
        verification_date: fullProfile?.verification_date
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return 'N/A'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount * 100000) // Assuming amount is in lakhs
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            case 'inactive':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            case 'suspended':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    const getTabColors = (tabId: string) => {
        switch (tabId) {
            case 'basic':
                return {
                    active: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
                    indicator: 'bg-blue-500',
                    icon: 'text-blue-600 dark:text-blue-400'
                }
            case 'academic':
                return {
                    active: 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
                    indicator: 'bg-purple-500',
                    icon: 'text-purple-600 dark:text-purple-400'
                }
            case 'placement':
                return {
                    active: 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
                    indicator: 'bg-green-500',
                    icon: 'text-green-600 dark:text-green-400'
                }
            case 'contact':
                return {
                    active: 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
                    indicator: 'bg-orange-500',
                    icon: 'text-orange-600 dark:text-orange-400'
                }
            default:
                return {
                    active: 'border-gray-500 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20',
                    indicator: 'bg-gray-500',
                    icon: 'text-gray-600 dark:text-gray-400'
                }
        }
    }

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User },
        { id: 'academic', label: 'Academic', icon: GraduationCap },
        { id: 'placement', label: 'Placement', icon: TrendingUp },
        { id: 'contact', label: 'Contact', icon: Mail }
    ]

    const renderTabContent = () => {
        console.log('Rendering tab content for activeTab:', activeTab)
        try {
            switch (activeTab) {
                case 'basic':
                    console.log('Rendering basic info')
                    return renderBasicInfo()
                case 'academic':
                    console.log('Rendering academic info')
                    return renderAcademicInfo()
                case 'placement':
                    console.log('Rendering placement info')
                    return renderPlacementInfo()
                case 'contact':
                    console.log('Rendering contact info')
                    return renderContactInfo()
                default:
                    console.log('Rendering default (basic) info')
                    return renderBasicInfo()
            }
        } catch (error) {
            console.error('Error rendering tab content for tab:', activeTab, error)
            return (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Error Loading Content
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            There was an error loading this tab's content.
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                            Tab: {activeTab}
                        </p>
                    </div>
                </div>
            )
        }
    }

    const renderBasicInfo = () => {
        if (!extendedUniversity) {
            console.error('UniversityProfileModal - extendedUniversity is undefined in renderBasicInfo')
            return (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Error Loading Basic Info
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Unable to load basic information.
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {/* University Information */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                            University Information
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {extendedUniversity.university_name}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">University Name</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {extendedUniversity.institute_type || 'Not specified'}
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">Institute Type</p>
                                </div>
                            </div>
                            {extendedUniversity.established_year && (
                                <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {extendedUniversity.established_year}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400">Established Year</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatDate(extendedUniversity.created_at)}
                                    </p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400">Joined Platform</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                    <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {extendedUniversity.total_students || 'N/A'}
                                    </p>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400">Total Students</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {extendedUniversity.verified ? 'Verified' : 'Unverified'}
                                    </p>
                                    <p className="text-xs text-red-600 dark:text-red-400">Verification Status</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                {extendedUniversity.bio && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                About
                            </h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {extendedUniversity.bio}
                        </p>
                    </div>
                )}
            </div>
        )
    }

    const renderAcademicInfo = () => {
        if (!extendedUniversity) {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Error Loading Academic Info
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Unable to load academic information.
                        </p>
                    </div>
                </div>
            )
        }

        // Check if we have any academic data
        const hasAcademicData = extendedUniversity.courses_offered ||
            extendedUniversity.departments ||
            extendedUniversity.programs_offered ||
            extendedUniversity.total_faculty

        if (!hasAcademicData) {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No Academic Data Available
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This university hasn't provided academic information yet.
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Contact the university to add academic details.
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {/* Academic Programs */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-sm border border-purple-200 dark:border-purple-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                            Academic Programs
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {extendedUniversity.courses_offered && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-purple-800 dark:text-purple-200">Courses Offered</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                    {extendedUniversity.courses_offered}
                                </p>
                            </div>
                        )}
                        {extendedUniversity.departments && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-purple-800 dark:text-purple-200">Departments</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                    {extendedUniversity.departments}
                                </p>
                            </div>
                        )}
                        {extendedUniversity.programs_offered && (
                            <div className="space-y-3 md:col-span-2">
                                <h4 className="font-medium text-purple-800 dark:text-purple-200">Programs Offered</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                    {extendedUniversity.programs_offered}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Faculty Information */}
                {extendedUniversity.total_faculty && (
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-700 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                                Faculty Information
                            </h3>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {extendedUniversity.total_faculty}
                                </p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400">Total Faculty</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderPlacementInfo = () => {
        if (!extendedUniversity) {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Error Loading Placement Info
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Unable to load placement information.
                        </p>
                    </div>
                </div>
            )
        }

        // Check if we have any placement data
        const hasPlacementData = extendedUniversity.placement_rate ||
            extendedUniversity.average_package ||
            extendedUniversity.total_students ||
            extendedUniversity.top_recruiters

        if (!hasPlacementData) {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No Placement Data Available
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This university hasn't provided placement statistics yet.
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Contact the university to add placement information.
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {/* Placement Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {extendedUniversity.placement_rate && (
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-sm border border-green-200 dark:border-green-700 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <h4 className="font-medium text-green-800 dark:text-green-200">Placement Rate</h4>
                            </div>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {extendedUniversity.placement_rate}%
                            </p>
                        </div>
                    )}
                    {extendedUniversity.average_package && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h4 className="font-medium text-blue-800 dark:text-blue-200">Average Package</h4>
                            </div>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(extendedUniversity.average_package)}
                            </p>
                        </div>
                    )}
                    {extendedUniversity.total_students && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-sm border border-purple-200 dark:border-purple-700 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h4 className="font-medium text-purple-800 dark:text-purple-200">Total Students</h4>
                            </div>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {extendedUniversity.total_students}
                            </p>
                        </div>
                    )}
                </div>

                {/* Top Recruiters */}
                {extendedUniversity.top_recruiters && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-sm border border-orange-200 dark:border-orange-700 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                                Top Recruiters
                            </h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                            {extendedUniversity.top_recruiters}
                        </p>
                    </div>
                )}
            </div>
        )
    }

    const renderContactInfo = () => {
        if (!extendedUniversity) {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Error Loading Contact Info
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Unable to load contact information.
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-sm border border-orange-200 dark:border-orange-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                            Contact Information
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {extendedUniversity.email}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">Email Address</p>
                                    {extendedUniversity.email_verified && (
                                        <span className="inline-flex items-center text-xs text-green-600 dark:text-green-400">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                            {extendedUniversity.phone && (
                                <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {extendedUniversity.phone}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400">Phone Number</p>
                                        {extendedUniversity.phone_verified && (
                                            <span className="inline-flex items-center text-xs text-green-600 dark:text-green-400">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {extendedUniversity.website_url && (
                                <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            <a
                                                href={extendedUniversity.website_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {extendedUniversity.website_url}
                                                <ExternalLink className="w-3 h-3 inline ml-1" />
                                            </a>
                                        </p>
                                        <p className="text-xs text-purple-600 dark:text-purple-400">Website</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            {extendedUniversity.address && (
                                <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                        <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {extendedUniversity.address}
                                        </p>
                                        <p className="text-xs text-red-600 dark:text-red-400">Address</p>
                                    </div>
                                </div>
                            )}
                            {extendedUniversity.contact_person_name && (
                                <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {extendedUniversity.contact_person_name}
                                        </p>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400">Contact Person</p>
                                        {extendedUniversity.contact_designation && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {extendedUniversity.contact_designation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return createPortal(
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
        >
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full mx-2 sm:mx-4 h-[90vh] sm:h-[80vh] lg:h-[75vh] overflow-hidden flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Profile image and name removed from top */}
                        </div>
                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                title="Close"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Overview */}
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 p-3 sm:p-4 lg:p-6 border-b border-blue-200 dark:border-blue-700">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 lg:gap-6">
                        {/* Profile Avatar & Basic Info */}
                        <div className="text-center sm:text-left">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto sm:mx-0 mb-2 sm:mb-3 relative">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg overflow-hidden">
                                    {extendedUniversity.profile_picture ? (
                                        <img
                                            src={extendedUniversity.profile_picture}
                                            alt={extendedUniversity.university_name}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                                            onError={(e) => {
                                                // Fallback to initials if image fails to load
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = `<span class="text-xl font-bold text-white">${getInitials(extendedUniversity.university_name)}</span>`;
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="text-xl font-bold text-white">
                                            {getInitials(extendedUniversity.university_name)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {extendedUniversity.university_name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {extendedUniversity.institute_type || 'Educational Institution'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {extendedUniversity.established_year ? `Est. ${extendedUniversity.established_year}` : 'University'}
                            </p>
                        </div>

                        {/* Profile Stats */}
                        <div className="flex-1 w-full">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                                {/* Email Card - Blue Theme */}
                                <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Email</span>
                                    {extendedUniversity.email_verified ? (
                                        <div className="p-1.5 bg-green-500 rounded-full">
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </div>
                                    ) : (
                                        <div className="p-1.5 bg-yellow-500 rounded-full">
                                            <AlertCircle className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Phone Card - Purple Theme */}
                                <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-purple-50/80 dark:bg-purple-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                                    <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Phone</span>
                                    {extendedUniversity.phone_verified ? (
                                        <div className="p-1.5 bg-green-500 rounded-full">
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </div>
                                    ) : (
                                        <div className="p-1.5 bg-yellow-500 rounded-full">
                                            <AlertCircle className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Status Card - Orange Theme */}
                                <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-orange-50/80 dark:bg-orange-900/20 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
                                    <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">Status</span>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(extendedUniversity.status)}`}>
                                        {extendedUniversity.status}
                                    </div>
                                </div>

                                {/* Verification Card - Green Theme */}
                                <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-green-50/80 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
                                    <span className="text-xs text-green-700 dark:text-green-300 font-medium">Verified</span>
                                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                        {extendedUniversity.verified ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const colors = getTabColors(tab.id)
                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1 sm:gap-2 lg:gap-3 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm lg:text-base font-medium whitespace-nowrap border-b-2 transition-all duration-200 relative ${activeTab === tab.id
                                        ? colors.active
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Icon className={`w-4 h-4 ${activeTab === tab.id ? colors.icon : ''}`} />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            className={`absolute bottom-0 left-0 right-0 h-0.5 ${colors.indicator}`}
                                            layoutId="activeTab"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            )
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        renderTabContent()
                    )}
                </div>

            </motion.div>
        </motion.div>,
        document.body
    )
}
