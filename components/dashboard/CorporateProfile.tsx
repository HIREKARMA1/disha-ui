"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Building2,
    Globe,
    Zap,
    Shield,
    Trophy,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Camera,
    FileText,
    Users,
    MapPin,
    Calendar,
    Phone,
    Mail,
    ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CorporateDashboardLayout } from './CorporateDashboardLayout'
import { FileUpload } from '../ui/file-upload'
import { ImageModal } from '../ui/image-modal'
import { cn, getInitials, truncateText } from '@/lib/utils'
import { corporateProfileService } from '@/services/corporateProfileService'
import { type CorporateProfile, type CorporateProfileUpdateData } from '@/types/corporate'
import { useAuth } from '@/hooks/useAuth'

interface ProfileSection {
    id: string
    title: string
    icon: any
    fields: string[]
    completed: boolean
}

export function CorporateProfile() {
    const [profile, setProfile] = useState<CorporateProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')
    const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; altText: string }>({
        isOpen: false,
        imageUrl: '',
        altText: ''
    })

    const profileSections: ProfileSection[] = [
        {
            id: 'basic',
            title: 'Basic Information',
            icon: Building2,
            fields: ['name', 'email', 'phone', 'bio', 'company_logo'],
            completed: false
        },
        {
            id: 'company',
            title: 'Company Information',
            icon: Building2,
            fields: ['company_name', 'website_url', 'industry', 'company_size', 'founded_year', 'company_type', 'description'],
            completed: false
        },
        {
            id: 'contact',
            title: 'Contact Details',
            icon: Users,
            fields: ['contact_person', 'contact_designation', 'address'],
            completed: false
        },
        {
            id: 'documents',
            title: 'Documents & Certificates',
            icon: Shield,
            fields: ['company_logo', 'mca_gst_certificate'],
            completed: false
        }
    ]

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Building2 },
        { id: 'company', label: 'Company', icon: Building2 },
        { id: 'contact', label: 'Contact', icon: Users }
    ]

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setError(null)

            const profileData = await corporateProfileService.getProfile()
            setProfile(profileData)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (sectionId: string, formData: CorporateProfileUpdateData) => {
        try {
            setSaving(true)
            setError(null)

            console.log('Saving corporate profile data for section:', sectionId)
            console.log('Form data being sent:', formData)

            const updatedProfile = await corporateProfileService.updateProfile(formData)
            console.log('Profile updated successfully:', updatedProfile)

            setProfile(updatedProfile)
            setEditing(null)
        } catch (error: any) {
            console.error('Error saving corporate profile:', error)
            setError(error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <CorporateDashboardLayout>
                <div className="w-full">
                    <div className="animate-pulse space-y-4 lg:space-y-6">
                        <div className="h-6 lg:h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
                            <div className="xl:col-span-1">
                                <div className="h-80 lg:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                            <div className="xl:col-span-3 space-y-4 lg:space-y-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-24 lg:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CorporateDashboardLayout>
        )
    }

    if (error && !profile) {
        return (
            <CorporateDashboardLayout>
                <div className="w-full text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
                        <AlertCircle className="w-12 h-12 lg:w-16 lg:h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Unable to Load Profile
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {error}
                        </p>
                        <Button onClick={loadProfile} variant="default">
                            Try Again
                        </Button>
                    </div>
                </div>
            </CorporateDashboardLayout>
        )
    }

    if (!profile) {
        return (
            <CorporateDashboardLayout>
                <div className="w-full text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
                        <AlertCircle className="w-12 h-12 lg:w-16 lg:h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Profile Not Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Unable to load your profile. Please try again later.
                        </p>
                    </div>
                </div>
            </CorporateDashboardLayout>
        )
    }

    return (
        <CorporateDashboardLayout>
            <div className="w-full">
                {/* Header - Consistent with other sections */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Company Profile 🏢
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage your company information and business details ✨
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                    📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                    📈 Business Growth
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    🚀 Talent Acquisition
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
                        {/* Top Horizontal Section - Profile Overview */}
                        <div className="xl:col-span-4">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4 lg:p-6 hover:shadow-md transition-all duration-300">
                                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                                    {/* Profile Avatar & Info */}
                                    <div className="text-center lg:text-left">
                                        <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto lg:mx-0 mb-4 relative">
                                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                                {profile.company_logo ? (
                                                    <img
                                                        src={profile.company_logo}
                                                        alt={profile.company_name}
                                                        className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xl lg:text-2xl font-bold text-white">
                                                        {getInitials(profile.company_name)}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                className="absolute -bottom-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-white rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-md border border-gray-200 hover:scale-110"
                                                onClick={() => setEditing('basic')}
                                                title="Change profile picture"
                                            >
                                                <Camera className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                            </button>
                                        </div>
                                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                                            {profile.company_name}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {profile.industry || 'Company'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {profile.company_size} • {profile.company_type}
                                        </p>
                                    </div>

                                    {/* Profile Stats */}
                                    <div className="flex-1">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
                                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
                                                <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Email</span>
                                                {profile.email_verified ? (
                                                    <div className="p-1.5 bg-green-500 rounded-full">
                                                        <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1.5 bg-yellow-500 rounded-full">
                                                        <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                                                <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Phone</span>
                                                {profile.phone_verified ? (
                                                    <div className="p-1.5 bg-green-500 rounded-full">
                                                        <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1.5 bg-yellow-500 rounded-full">
                                                        <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50/80 to-violet-50/80 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm">
                                                <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Logo</span>
                                                {profile.company_logo ? (
                                                    <div className="p-1.5 bg-green-500 rounded-full">
                                                        <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1.5 bg-yellow-500 rounded-full">
                                                        <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200/50 dark:border-amber-700/50 backdrop-blur-sm">
                                                <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Verified</span>
                                                {profile.verified ? (
                                                    <div className="p-1.5 bg-green-500 rounded-full">
                                                        <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1.5 bg-yellow-500 rounded-full">
                                                        <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tab-based Profile Sections */}
                        <div className="xl:col-span-4">
                            {/* Tab Navigation */}
                            <div className="mb-6">
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <nav className="-mb-px flex space-x-8 overflow-x-auto">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={cn(
                                                    "flex items-center space-x-2 py-3 px-1 border-b-2 font-bold text-l transition-colors duration-200",
                                                    activeTab === tab.id
                                                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                                )}
                                            >
                                                <tab.icon className="w-4 h-4" />
                                                <span>{tab.label}</span>
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="min-h-[600px]">
                                {activeTab === 'basic' && (
                                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                                    <Building2 className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Company details and contact information</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditing('basic')}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 dark:text-blue-400 dark:hover:bg-blue-900/20 text-xs transition-all duration-200"
                                            >
                                                <ChevronRight className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                        </div>

                                        {editing === 'basic' ? (
                                            <ProfileSectionForm
                                                section={{ id: 'basic', title: 'Basic Information', icon: Building2, fields: ['name', 'email', 'phone', 'bio', 'company_logo'], completed: false }}
                                                profile={profile}
                                                onSave={(formData) => handleSave('basic', formData)}
                                                saving={saving}
                                                onCancel={() => setEditing(null)}
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                        Company Name
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {profile.company_name || 'Company name not provided'}
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                        Contact Information
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {profile.email || 'Email not provided'}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        Phone: {profile.phone || 'Not provided'}
                                                    </div>
                                                </div>

                                                {profile.bio && (
                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                            Bio
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {profile.bio}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'company' && (
                                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                                                    <Building2 className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Company Information</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Business details and company profile</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditing('company')}
                                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/80 dark:text-emerald-400 dark:hover:bg-emerald-900/20 text-xs transition-all duration-200"
                                            >
                                                <ChevronRight className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                        </div>

                                        {editing === 'company' ? (
                                            <ProfileSectionForm
                                                section={{ id: 'company', title: 'Company Information', icon: Building2, fields: ['company_name', 'website_url', 'industry', 'company_size', 'founded_year', 'company_type', 'description'], completed: false }}
                                                profile={profile}
                                                onSave={(formData) => handleSave('company', formData)}
                                                saving={saving}
                                                onCancel={() => setEditing(null)}
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                        Industry & Size
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {profile.industry || 'Industry not specified'} • {profile.company_size || 'Size not specified'}
                                                    </div>
                                                </div>

                                                {profile.company_type && (
                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                            Company Type
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {profile.company_type}
                                                        </div>
                                                    </div>
                                                )}

                                                {profile.founded_year && (
                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                            Founded Year
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {profile.founded_year}
                                                        </div>
                                                    </div>
                                                )}

                                                {profile.website_url && (
                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                            Website
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            <a
                                                                href={profile.website_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center space-x-1 hover:text-blue-600"
                                                            >
                                                                <span>{profile.website_url}</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                {profile.description && (
                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                            Description
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {profile.description}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'contact' && (
                                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                                                    <Users className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Details</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Contact person and address information</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditing('contact')}
                                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50/80 dark:text-purple-400 dark:hover:bg-purple-900/20 text-xs transition-all duration-200"
                                            >
                                                <ChevronRight className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                        </div>

                                        {editing === 'contact' ? (
                                            <ProfileSectionForm
                                                section={{ id: 'contact', title: 'Contact Details', icon: Users, fields: ['contact_person', 'contact_designation', 'address'], completed: false }}
                                                profile={profile}
                                                onSave={(formData) => handleSave('contact', formData)}
                                                saving={saving}
                                                onCancel={() => setEditing(null)}
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                {(profile.contact_person || profile.contact_designation) && (
                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                            Contact Person
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {profile.contact_person || 'Not specified'}
                                                        </div>
                                                        {profile.contact_designation && (
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {profile.contact_designation}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {profile.address && (
                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                            Address
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {profile.address}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Modal */}
                <ImageModal
                    isOpen={imageModal.isOpen}
                    imageUrl={imageModal.imageUrl}
                    altText={imageModal.altText}
                    onClose={() => setImageModal({ isOpen: false, imageUrl: '', altText: '' })}
                />
            </div>
        </CorporateDashboardLayout>
    )
}

// Inline ProfileSectionForm Component for Corporate Profile
interface ProfileSectionFormProps {
    section: {
        id: string
        title: string
        icon: any
        fields: string[]
        completed: boolean
    }
    profile: CorporateProfile
    onSave: (formData: any) => void
    saving: boolean
    onCancel: () => void
}

function ProfileSectionForm({ section, profile, onSave, saving, onCancel }: ProfileSectionFormProps) {
    const { getToken } = useAuth()
    const [formData, setFormData] = useState<any>({})
    const [uploading, setUploading] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

    useEffect(() => {
        if (profile && section) {
            // Initialize form data with current profile values
            const initialData: any = {}
            section.fields.forEach(field => {
                initialData[field] = profile[field as keyof CorporateProfile] || ''
            })
            setFormData(initialData)
        }
    }, [profile, section])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate phone number if provided
        if (formData.phone && formData.phone.length !== 10) {
            setUploadError('Phone number must be exactly 10 digits')
            return
        }
        
        const cleanedFormData = { ...formData }
        Object.keys(cleanedFormData).forEach(key => {
            if (cleanedFormData[key] === '') {
                cleanedFormData[key] = null
            } else if (key === 'founded_year' && cleanedFormData[key] !== null) {
                // Ensure founded_year is converted to number
                cleanedFormData[key] = parseInt(cleanedFormData[key]) || null
            }
        })
        onSave(cleanedFormData)
    }

    const handleFileUpload = async (field: string, file: File) => {
        setUploading(field)
        setUploadError(null)
        try {
            console.log('Starting file upload for field:', field)
            console.log('File details:', { name: file.name, size: file.size, type: file.type })

            let response
            switch (field) {
                case 'company_logo':
                    response = await corporateProfileService.uploadCompanyLogo(file)
                    break
                case 'mca_gst_certificate':
                    response = await corporateProfileService.uploadCertificate(file)
                    break
                default:
                    throw new Error('Unknown field type')
            }
            const fileUrl = response.file_url || ''
            setFormData({ ...formData, [field]: fileUrl })
            setUploadSuccess(field)
            setUploadError(null)
            setTimeout(() => setUploadSuccess(null), 3000)
        } catch (error) {
            console.error('File upload error:', error)
            setUploadError(error instanceof Error ? error.message : 'Upload failed')
            setUploadSuccess(null)
        } finally {
            setUploading(null)
        }
    }

    const handleFileRemove = (field: string) => {
        setFormData({ ...formData, [field]: '' })
        setUploadError(null)
    }

    const renderField = (field: string) => {
        const value = formData[field] || ''

        // Handle file upload fields
        if (field === 'company_logo') {
            return (
                <div className="space-y-3">
                    <FileUpload
                        type="image"
                        onFileSelect={(file) => handleFileUpload(field, file)}
                        onFileRemove={() => handleFileRemove(field)}
                        currentFile={value}
                        placeholder={`Upload your ${field.replace(/_/g, ' ')}`}
                        disabled={uploading === field}
                    />
                    {uploading === field && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                        </div>
                    )}
                </div>
            )
        }

        if (field === 'mca_gst_certificate') {
            return (
                <div className="space-y-3">
                    <FileUpload
                        type="document"
                        onFileSelect={(file) => handleFileUpload(field, file)}
                        onFileRemove={() => handleFileRemove(field)}
                        currentFile={value}
                        placeholder="Upload MCA/GST certificate (PDF only)"
                        disabled={uploading === field}
                    />
                    {uploading === field && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                        </div>
                    )}
                </div>
            )
        }

        if (field.includes('bio') || field.includes('description')) {
            return (
                <textarea
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                />
            )
        }

        if (field === 'website_url') {
            return (
                <input
                    type="url"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your website URL"
                />
            )
        }

        if (field === 'founded_year') {
            return (
                <input
                    type="number"
                    min="1800"
                    max="2024"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value === '' ? null : parseInt(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter founded year"
                />
            )
        }

        if (field === 'company_size') {
            return (
                <select
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                </select>
            )
        }

        if (field === 'company_type') {
            return (
                <select
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    <option value="">Select company type</option>
                    <option value="startup">Startup</option>
                    <option value="mnc">MNC</option>
                    <option value="sme">SME</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="government">Government</option>
                    <option value="ngo">NGO</option>
                </select>
            )
        }

        // Handle name field with alphabet-only validation
        if (field === 'name') {
            return (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        const inputValue = e.target.value
                        // Only allow alphabets, spaces, and common punctuation
                        const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g, '')
                        setFormData({ ...formData, [field]: sanitizedValue })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your name (alphabets only)"
                    maxLength={50}
                />
            )
        }

        // Handle email field - make it read-only
        if (field === 'email') {
            return (
                <div className="space-y-2">
                    <input
                        type="email"
                        value={value}
                        readOnly
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        placeholder="Email cannot be edited"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Email cannot be changed for security reasons
                    </p>
                </div>
            )
        }

        // Handle phone field with numeric validation and max length
        if (field === 'phone') {
            return (
                <input
                    type="tel"
                    value={value}
                    onChange={(e) => {
                        const inputValue = e.target.value
                        // Only allow numbers and limit to 10 digits
                        const numericValue = inputValue.replace(/[^0-9]/g, '').slice(0, 10)
                        setFormData({ ...formData, [field]: numericValue })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                />
            )
        }

        return (
            <input
                type="text"
                value={value}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
            />
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display upload errors */}
            {uploadError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>{uploadError}</span>
                    </div>
                </div>
            )}

            {/* Display upload success */}
            {uploadSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>File uploaded successfully!</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => (
                    <div key={field} className={field.includes('bio') || field.includes('description') ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                            {field.replace(/_/g, ' ')}
                        </label>
                        {renderField(field)}
                    </div>
                ))}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={saving}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {saving ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                        </div>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </div>
        </form>
    )
}
