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
    ExternalLink,
    User,
    Settings,
    Crown,
    Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminDashboardLayout } from './AdminDashboardLayout'
import { FileUpload } from '../ui/file-upload'
import { ImageModal } from '../ui/image-modal'
import { cn, getInitials, truncateText } from '@/lib/utils'
import { adminProfileService } from '@/services/adminProfileService'
import { type AdminProfile, type AdminProfileUpdateData } from '@/types/admin'
import { useAuth } from '@/hooks/useAuth'

interface ProfileSection {
    id: string
    title: string
    icon: any
    fields: string[]
    completed: boolean
}

export function AdminProfile() {
    const [profile, setProfile] = useState<AdminProfile | null>(null)
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
            icon: User,
            fields: ['name', 'email', 'phone', 'bio', 'profile_picture'],
            completed: false
        }
        // {
        //     id: 'admin',
        //     title: 'Admin Settings',
        //     icon: Shield,
        //     fields: ['role', 'permissions'],
        //     completed: false
        // }
    ]

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User }
        // { id: 'admin', label: 'Admin Settings', icon: Shield }
    ]

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            const profileData = await adminProfileService.getProfile()
            setProfile(profileData)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (sectionId: string, formData: AdminProfileUpdateData) => {
        try {
            setSaving(true)
            setError(null)

            console.log('Saving admin profile data for section:', sectionId)
            console.log('Form data being sent:', formData)

            const updatedProfile = await adminProfileService.updateProfile(formData)
            console.log('Profile updated successfully:', updatedProfile)

            setProfile(updatedProfile)
            setEditing(null) // Exit edit mode after saving
        } catch (error: any) {
            console.error('Error saving admin profile:', error)
            setError(error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminDashboardLayout>
                <div className="w-full text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Loading Profile
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please wait while we load your admin profile...
                        </p>
                    </div>
                </div>
            </AdminDashboardLayout>
        )
    }

    if (error && !profile) {
        return (
            <AdminDashboardLayout>
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
            </AdminDashboardLayout>
        )
    }

    if (!profile) {
        return (
            <AdminDashboardLayout>
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
            </AdminDashboardLayout>
        )
    }

    return (
        <AdminDashboardLayout>
            <div className="w-full">
                {/* Header - Consistent with other sections */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Admin Profile 👑
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage your admin profile and system access ✨
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                    📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                    🛡️ Admin Access
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    🚀 Full Control
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
                                                {profile.profile_picture ? (
                                                    <img
                                                        src={profile.profile_picture}
                                                        alt={profile.name}
                                                        className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xl lg:text-2xl font-bold text-white">
                                                        {getInitials(profile.name)}
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
                                            {profile.name}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {profile.role || 'Administrator'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Admin • {profile.tenant_id || 'System'}
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
                                                <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Profile</span>
                                                {profile.profile_picture ? (
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
                                                <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Status</span>
                                                <div className="p-1.5 bg-green-500 rounded-full">
                                                    <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                </div>
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
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Personal details and contact information</p>
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
                                                section={{ id: 'basic', title: 'Basic Information', icon: User, fields: ['name', 'email', 'phone', 'bio', 'profile_picture'], completed: false }}
                                                profile={profile}
                                                onSave={(formData) => handleSave('basic', formData)}
                                                saving={saving}
                                                onCancel={() => setEditing(null)}
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                        Name
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {profile.name}
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                        Email
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {profile.email}
                                                    </div>
                                                </div>

                                                {profile.phone && (
                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                            Phone
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {profile.phone}
                                                        </div>
                                                    </div>
                                                )}

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

                                                {profile.profile_picture && (
                                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                            Profile Picture
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <img
                                                                    src={profile.profile_picture}
                                                                    alt="Profile Picture"
                                                                    className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
                                                                />
                                                                <span className="text-sm text-green-600 dark:text-green-400">✓ Uploaded</span>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setImageModal({
                                                                    isOpen: true,
                                                                    imageUrl: profile.profile_picture!,
                                                                    altText: 'Profile Picture'
                                                                })}
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                            >
                                                                <Camera className="w-4 h-4 mr-2" />
                                                                View Image
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* {activeTab === 'admin' && (
                                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                                                    <Shield className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Settings</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Role and permissions information</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                    Role
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {profile.role || 'Admin'}
                                                </div>
                                            </div>

                                            {profile.permissions && profile.permissions.length > 0 && (
                                                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                        Permissions
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.permissions.map((permission, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-md"
                                                            >
                                                                {permission}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                    Tenant ID
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {profile.tenant_id || 'default'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )} */}
                            </div>
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
        </AdminDashboardLayout>
    )
}

// Inline ProfileSectionForm Component for Admin Profile
interface ProfileSectionFormProps {
    section: {
        id: string
        title: string
        icon: any
        fields: string[]
        completed: boolean
    }
    profile: AdminProfile
    onSave: (formData: any) => void
    saving: boolean
    onCancel: () => void
}

function ProfileSectionForm({ section, profile, onSave, saving, onCancel }: ProfileSectionFormProps) {
    const { getToken } = useAuth()
    const [formData, setFormData] = useState<any>({})
    const [uploading, setUploading] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)

    useEffect(() => {
        if (profile && section) {
            const initialData: any = {}
            section.fields.forEach(field => {
                initialData[field] = profile[field as keyof AdminProfile] || ''
            })
            setFormData(initialData)
        }
    }, [profile, section])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const cleanedFormData = { ...formData }
        Object.keys(cleanedFormData).forEach(key => {
            if (cleanedFormData[key] === '') {
                cleanedFormData[key] = null
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
                case 'profile_picture':
                    response = await adminProfileService.uploadProfilePicture(file)
                    break
                default:
                    throw new Error('Unknown field type for upload')
            }
            const fileUrl = response.file_url || ''
            setFormData({ ...formData, [field]: fileUrl })
            setUploadError(null)

            console.log('File uploaded to S3:', fileUrl)
        } catch (error: any) {
            console.error('File upload error:', error)
            setUploadError(error.message || 'Failed to upload file.')
        } finally {
            setUploading(null)
        }
    }

    const handleFileRemove = (field: string) => {
        setFormData({ ...formData, [field]: null })
    }

    const renderField = (field: string) => {
        const value = formData[field] || ''

        // Handle file upload fields
        if (field === 'profile_picture') {
            return (
                <div className="space-y-3">
                    <FileUpload
                        type="image"
                        onFileSelect={(file) => handleFileUpload(field, file)}
                        onFileRemove={() => handleFileRemove(field)}
                        currentFile={value}
                        placeholder="Upload your profile picture"
                        disabled={uploading === field}
                    />
                    {uploading === field && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                        </div>
                    )}
                    {uploadError && uploading === field && (
                        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>{uploadError}</span>
                        </div>
                    )}
                </div>
            )
        }

        // Handle textarea fields
        if (field === 'bio') {
            return (
                <textarea
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={4}
                    placeholder="Tell us about yourself..."
                />
            )
        }

        // Handle readonly fields
        if (field === 'email') {
            return (
                <input
                    type="email"
                    value={value}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    placeholder="Email address"
                />
            )
        }

        // Handle regular input fields
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
            {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{uploadError}</p>
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => (
                    <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        {renderField(field)}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    )
}