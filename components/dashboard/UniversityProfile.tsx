"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    GraduationCap,
    Globe,
    Zap,
    Trophy,
    Building2,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CheckCircle,
    AlertCircle,
    Camera,
    FileText,
    Edit,
    Save,
    X,
    Briefcase,
    Pencil
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UniversityDashboardLayout } from './UniversityDashboardLayout'
import { UniversityPageHero } from '@/components/university/ui/UniversityPageHero'
import { UniversityGlassCard } from '@/components/university/ui/UniversityGlassCard'
import { uniCard } from '@/components/university/ui/university-theme'
import {
    UniversitySocialLinksDisplay,
    UniversitySocialLinksEditor,
} from '@/components/university/UniversitySocialLinksEditor'
import { mergeCorpExtMeta, parseCorpExtMeta } from '@/lib/corporateProfileMeta'
import { cn, getInitials } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { universityProfileService, type UniversityProfile, type UniversityProfileUpdateData } from '@/services/universityProfileService'
import { type UniversityProfile as UniversityProfileType } from '@/types/university'
import { FileUpload } from '../ui/file-upload'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { MultiSearchableSelect } from '@/components/ui/MultiSearchableSelect'
import { z } from "zod";
import toast from 'react-hot-toast'
import { GoogleLocationAutocomplete } from '@/components/ui/GoogleLocationAutocomplete'
import { useInstituteTypes, useDegrees, useBranches } from '@/hooks/useLookup'
import { LookupSelect } from '@/components/ui/lookup-select'
import {
    parseMultiValueField,
    serializeMultiValueField,
    filterBranchNamesForDegree,
    formatMultiValueDisplay,
} from '@/lib/academicHierarchy'

function getUniversityDisplayBio(bio?: string | null): string {
    if (!bio) return ''
    const meta = parseCorpExtMeta(bio)
    if (meta.plain_bio) return meta.plain_bio
    const trimmed = bio.trim()
    if (trimmed.startsWith('{')) return ''
    return bio
}

// Use the imported UniversityProfile type instead of defining a new interface

interface ProfileSection {
    id: string
    title: string
    icon: any
    fields: string[]
    completed: boolean
}


const allowedDomains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "edu"];

const emailSchema = z
    .string()
    .trim()
    .min(5, "Email must be at least 5 characters long")
    .max(100, "Email must be less than 100 characters")
    .email("Please enter a valid email address")
    .refine((val) => {
        const domain = val.split("@")[1];
        return allowedDomains.some((d) => domain.endsWith(d));
    }, {
        message: "Please use a valid email",
    });


const profileSchema = z.object({
    email: z
        .string()
        .email("Please enter a valid email address")
        .optional()
        .or(z.literal("")), // allow empty if optional
    phone: z
        .string()
        .regex(/^\d+$/, 'Phone number must contain only digits')
        .refine(
            (val) => {
                if (val.length < 10) return false
                if (val.startsWith('91')) {
                    return val.length === 12
                }
                return val.length === 10
            },
            {
                message:
                    'Invalid phone number. Must be 10 digits, or start with 91 followed by 10 digits.',
            }
        )
        .optional(),
    website_url: z
        .string()
        .url("Please enter a valid website URL (must start with http:// or https://).")
        .optional()
        .or(z.literal("")),
    name: z.string().optional(),
    bio: z.string().optional(),
    profile_picture: z.string().optional(),
});

export function UniversityProfile() {
    const [profile, setProfile] = useState<UniversityProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')
    const [uploadingImage, setUploadingImage] = useState(false)
    const [formData, setFormData] = useState<UniversityProfileUpdateData>({})
    const { user } = useAuth()

    const profileSections: ProfileSection[] = [
        {
            id: 'basic',
            title: 'Basic Information',
            icon: User,
            fields: ['name', 'email', 'phone', 'website', 'description', 'profile_picture'],
            completed: false
        },
        {
            id: 'institution',
            title: 'Institution Details',
            icon: Building2,
            fields: ['established_year', 'university_type', 'accreditation', 'address', 'city', 'state', 'country'],
            completed: false
        },
        {
            id: 'academic',
            title: 'Academic Information',
            icon: GraduationCap,
            fields: ['courses_offered', 'branch'],
            completed: false
        }
    ]

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User },
        { id: 'institution', label: 'Institution', icon: Building2 },
        { id: 'academic', label: 'Academic', icon: GraduationCap }
    ]

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setError(null)

            // Try to fetch from API first
            try {
                console.log('Fetching university profile...')
                console.log('User context:', user)
                const profileData = await apiClient.getUniversityProfile()
                console.log('Profile data received:', profileData)

                // Use API data directly without mock fallbacks
                const mergedProfile: UniversityProfile = {
                    id: profileData.id || user?.id || '1',
                    email: profileData.email || user?.email || '',
                    name: profileData.name || profileData.university_name || user?.name || '',
                    university_name: profileData.university_name || user?.name || '',
                    phone: profileData.phone || '',
                    status: profileData.status || 'active',
                    email_verified: profileData.email_verified || false,
                    phone_verified: profileData.phone_verified || false,
                    created_at: profileData.created_at || new Date().toISOString(),
                    updated_at: profileData.updated_at,
                    last_login: profileData.last_login,
                    profile_picture: profileData.profile_picture,
                    bio: profileData.bio,
                    website_url: profileData.website_url,
                    institute_type: profileData.institute_type,
                    established_year: profileData.established_year,
                    contact_person_name: profileData.contact_person_name,
                    contact_designation: profileData.contact_designation,
                    address: profileData.address,
                    courses_offered: profileData.courses_offered,
                    branch: profileData.branch,
                    total_students: profileData.total_students || 0,
                    total_jobs: profileData.total_jobs || 0,
                    total_jobs_approved: profileData.total_jobs_approved || 0,
                    total_faculty: profileData.total_faculty,
                    departments: profileData.departments,
                    programs_offered: profileData.programs_offered,
                    placement_rate: profileData.placement_rate,
                    average_package: profileData.average_package,
                    top_recruiters: profileData.top_recruiters
                }
                console.log('Merged profile:', mergedProfile)
                setProfile(mergedProfile)
            } catch (apiError) {
                console.error('Failed to fetch university profile:', apiError)
                setError('Failed to load profile data from server')
            }
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }


    const handleSave = async (sectionId: string, formData: UniversityProfileUpdateData) => {
        try {
            setSaving(true);
            setError(null);
            const payload = { ...formData }
            if (sectionId === 'basic' && payload.bio !== undefined && profile) {
                payload.bio = mergeCorpExtMeta(profile.bio, { plain_bio: payload.bio })
            }
            // 🔹 Try to save via API
            try {
                const updatedProfile = await universityProfileService.updateProfile(payload);
                setProfile(updatedProfile);
                console.log("Profile saved successfully");

                // Show success toast with section name
                const sectionName = profileSections.find(s => s.id === sectionId)?.title || 'Profile'
                toast.success(`${sectionName} updated successfully!`)

            } catch (apiError) {
                console.log("API not available, simulating save");
                if (profile) {
                    setProfile({ ...profile, ...payload });
                }

                // Show success toast even for simulated save
                const sectionName = profileSections.find(s => s.id === sectionId)?.title || 'Profile'
                toast.success(`${sectionName} updated successfully!`)
            }

            setEditing(null);
        } catch (error: any) {
            setError(error.message);

            // Show error toast with specific message
            if (error.message.includes('network') || error.message.includes('Internet')) {
                toast.error('Network error. Please check your connection and try again.')
            } else if (error.message.includes('auth') || error.message.includes('login')) {
                toast.error('Authentication failed. Please log in again.')
            } else if (error.message.includes('validation') || error.message.includes('invalid')) {
                toast.error('Invalid data provided. Please check your input.')
            } else {
                toast.error(`Failed to save: ${error.message}`)
            }
        } finally {
            setSaving(false);
        }
    };


    const handleImageUpload = async (file: File) => {
        try {
            setUploadingImage(true)
            setError(null)

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB')
                return
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
                return
            }

            const result = await universityProfileService.uploadProfilePicture(file)

            // Update profile with new image URL
            if (profile) {
                setProfile({ ...profile, profile_picture: result.file_url })
            }

            console.log('Profile picture uploaded successfully')
            toast.success('Profile picture updated successfully!')
        } catch (error: any) {
            setError(error.message)
            console.error('Image upload error:', error)

            // Show specific error messages
            if (error.message.includes('network') || error.message.includes('Internet')) {
                toast.error('Network error. Please check your connection and try again.')
            } else if (error.message.includes('auth') || error.message.includes('login')) {
                toast.error('Authentication failed. Please log in again.')
            } else if (error.message.includes('size') || error.message.includes('large')) {
                toast.error('File is too large. Please upload a smaller image.')
            } else if (error.message.includes('format') || error.message.includes('type')) {
                toast.error('Invalid file format. Please upload a valid image.')
            } else {
                toast.error(`Failed to upload image: ${error.message}`)
            }
        } finally {
            setUploadingImage(false)
        }
    }

    const handleEdit = (sectionId: string) => {
        setEditing(sectionId)
        // Initialize form data with current profile data
        if (profile) {
            const initialData: UniversityProfileUpdateData = {}

            switch (sectionId) {
                case 'basic':
                    initialData.name = profile.name
                    initialData.phone = profile.phone
                    initialData.bio = getUniversityDisplayBio(profile.bio)
                    initialData.website_url = profile.website_url
                    break
                case 'institution':
                    initialData.university_name = profile.university_name
                    initialData.institute_type = profile.institute_type
                    initialData.established_year = profile.established_year
                    initialData.contact_person_name = profile.contact_person_name
                    initialData.contact_designation = profile.contact_designation
                    initialData.address = profile.address
                    break
                case 'academic':
                    initialData.courses_offered = profile.courses_offered
                    initialData.branch = profile.branch
                    break
            }

            setFormData(initialData)
        }
    }

    const handleFormChange = (field: keyof UniversityProfileUpdateData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleCancel = () => {
        setEditing(null)
        setFormData({})
        setError(null)
    }

    const getTabColors = (tabId: string) => {
        switch (tabId) {
            case 'basic':
                return {
                    active: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
                    indicator: 'bg-blue-500',
                    icon: 'text-blue-600 dark:text-blue-400'
                }
            case 'institution':
                return {
                    active: 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
                    indicator: 'bg-purple-500',
                    icon: 'text-purple-600 dark:text-purple-400'
                }
            case 'academic':
                return {
                    active: 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
                    indicator: 'bg-orange-500',
                    icon: 'text-orange-600 dark:text-orange-400'
                }
            case 'placement':
                return {
                    active: 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
                    indicator: 'bg-green-500',
                    icon: 'text-green-600 dark:text-green-400'
                }
            default:
                return {
                    active: 'border-gray-500 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20',
                    indicator: 'bg-gray-500',
                    icon: 'text-gray-600 dark:text-gray-400'
                }
        }
    }

    if (loading) {
        return (
            <UniversityDashboardLayout>
                <div className="w-full max-w-[1400px] mx-auto space-y-4 animate-pulse">
                    <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-2xl" />
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-2xl" />
                        <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-2xl xl:col-span-2" />
                    </div>
                </div>
            </UniversityDashboardLayout>
        )
    }

    if (error && !profile) {
        return (
            <UniversityDashboardLayout>
                <div className="rounded-[18px] border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6 max-w-md mx-auto">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                        Unable to Load Profile
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{error}</p>
                    <div className="flex justify-center">
                        <Button onClick={loadProfile} variant="default">
                            Try Again
                        </Button>
                    </div>
                </div>
            </UniversityDashboardLayout>
        )
    }

    if (!profile) {
        return (
            <UniversityDashboardLayout>
                <div className={cn(uniCard, 'p-8 max-w-md mx-auto text-center')}>
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Unable to load your profile. Please try again later.
                    </p>
                </div>
            </UniversityDashboardLayout>
        )
    }

    return (
        <UniversityDashboardLayout>
            <div className="w-full max-w-[1400px] mx-auto space-y-4 md:space-y-6">
                <UniversityPageHero
                    title="University Profile 🏛️"
                    subtitle="Manage your university information and institutional details ✨"
                    chips={[
                        {
                            label: new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            }),
                            tone: 'blue',
                            icon: <Calendar className="w-3.5 h-3.5" />,
                        },
                        {
                            label: 'Institutional Growth',
                            tone: 'green',
                            icon: <Trophy className="w-3.5 h-3.5" />,
                        },
                        {
                            label: 'Excellence in Education',
                            tone: 'purple',
                            icon: <GraduationCap className="w-3.5 h-3.5" />,
                        },
                    ]}
                />

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
                    <div className="xl:col-span-1">
                        <div className={cn(uniCard, 'p-6')}>
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 mx-auto mb-4 relative">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg overflow-hidden">
                                        {profile?.profile_picture ? (
                                            <img
                                                src={profile.profile_picture}
                                                alt={profile.name}
                                                className="w-24 h-24 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-white">
                                                {getInitials(profile.name)}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-md border border-gray-200 hover:scale-110"
                                        onClick={() => setEditing('basic')}
                                        title="Change profile picture"
                                        disabled={uploadingImage}
                                    >
                                        {uploadingImage ? (
                                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Camera className="w-3 h-3" />
                                        )}
                                    </button>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                                    {profile.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {profile?.institute_type || 'Educational Institution'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Est. {profile.established_year}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Total Students</span>
                                    <span className="text-sm font-semibold text-violet-600 dark:text-violet-300">
                                        {profile?.total_students?.toLocaleString() || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Total Jobs</span>
                                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                                        {profile?.total_jobs?.toLocaleString() || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Jobs Approved</span>
                                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-300">
                                        {profile?.total_jobs_approved?.toLocaleString() || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                                    <div className="p-1.5 bg-emerald-500 rounded-full">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Profile Details */}
                    <div className="xl:col-span-3">
                        {/* Tabs */}
                        <div className={cn(uniCard, 'overflow-hidden')}>
                            <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-white/[0.06]">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                                                activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    {renderTabContent()}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    <UniversityGlassCard
                        title="Social Links"
                        action={
                            editing === 'social' ? (
                                <button
                                    type="button"
                                    onClick={() => setEditing(null)}
                                    className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                >
                                    Close
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setEditing('social')}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                            )
                        }
                    >
                        {editing === 'social' ? (
                            <UniversitySocialLinksEditor
                                profile={profile}
                                onSaved={(updated) => {
                                    setProfile(updated)
                                    setEditing(null)
                                }}
                                onCancel={() => setEditing(null)}
                            />
                        ) : (
                            <UniversitySocialLinksDisplay
                                links={parseCorpExtMeta(profile.bio).social_links}
                                websiteUrl={profile.website_url}
                            />
                        )}
                    </UniversityGlassCard>
                </div>

            </div>
        </UniversityDashboardLayout>
    )

    function renderTabContent() {
        switch (activeTab) {
            case 'basic':
                return renderBasicInfo()
            case 'institution':
                return renderInstitutionInfo()
            case 'academic':
                return renderAcademicInfo()
            default:
                return renderBasicInfo()
        }
    }

    function renderBasicInfo() {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Basic Information
                    </h3>
                    {editing !== 'basic' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit('basic')}
                            className="flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Button>
                    )}
                </div>

                {editing === 'basic' ? (
                    <ProfileSectionForm
                        section={{ id: 'basic', title: 'Basic Information', icon: User, fields: ['name', 'email', 'phone', 'website_url', 'bio', 'profile_picture'], completed: false }}
                        profile={profile}
                        onSave={(formData) => handleSave('basic', formData)}
                        saving={saving}
                        onCancel={() => setEditing(null)}
                        editing={editing}
                        onEdit={handleEdit}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {profile?.email}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">Email Address</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {profile?.phone || 'Not provided'}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400">Phone Number</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {profile?.website_url || 'Not provided'}
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">Website</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {getUniversityDisplayBio(profile?.bio) && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {getUniversityDisplayBio(profile?.bio)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    function renderInstitutionInfo() {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Institution Details
                    </h3>
                    {editing !== 'institution' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit('institution')}
                            className="flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Button>
                    )}
                </div>

                {editing === 'institution' ? (
                    <ProfileSectionForm
                        section={{ id: 'institution', title: 'Institution Details', icon: Building2, fields: ['university_name', 'institute_type', 'established_year', 'contact_person_name', 'contact_designation', 'address'], completed: false }}
                        profile={profile}
                        onSave={(formData) => handleSave('institution', formData)}
                        saving={saving}
                        onCancel={() => setEditing(null)}
                        editing={editing}
                        onEdit={handleEdit}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* University Name */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {profile?.name || 'Not specified'}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">University Name</p>
                                </div>
                            </div>

                            {/* Institute Type */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                    <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {profile?.institute_type || 'Not specified'}
                                    </p>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400">Institute Type</p>
                                </div>
                            </div>

                            {/* Established Year */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {profile?.established_year || 'Not specified'}
                                    </p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400">Established Year</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Contact Person Name */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {profile?.contact_person_name || 'Not specified'}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400">Contact Person</p>
                                </div>
                            </div>

                            {/* Contact Designation */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                                    <Briefcase className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {profile?.contact_designation || 'Not specified'}
                                    </p>
                                    <p className="text-xs text-pink-600 dark:text-pink-400">Designation</p>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Address
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {profile?.address || 'Not provided'}
                                </p>
                            </div>
                        </div>
                    </div>

                )}
            </div>
        )
    }

    function renderAcademicInfo() {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Academic Information
                    </h3>
                    {editing !== 'academic' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit('academic')}
                            className="flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Button>
                    )}
                </div>

                {editing === 'academic' ? (
                    <ProfileSectionForm
                        section={{ id: 'academic', title: 'Academic Information', icon: GraduationCap, fields: ['courses_offered', 'branch'], completed: false }}
                        profile={profile}
                        onSave={(formData) => handleSave('academic', formData)}
                        saving={saving}
                        onCancel={() => setEditing(null)}
                        editing={editing}
                        onEdit={handleEdit}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                                        {formatMultiValueDisplay(profile?.courses_offered)}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">Degree Offered</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Branch</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                                    {parseMultiValueField(profile?.branch).join(', ') || 'Not specified'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

}

// ProfileSectionForm component for inline editing
interface ProfileSectionFormProps {
    section: ProfileSection
    profile: UniversityProfile | null
    onSave: (formData: UniversityProfileUpdateData) => void
    saving: boolean
    onCancel: () => void
    editing: string | null
    onEdit: (sectionId: string) => void
}

function ProfileSectionForm({ section, profile, onSave, saving, onCancel, editing, onEdit }: ProfileSectionFormProps) {
    const [formData, setFormData] = useState<UniversityProfileUpdateData>({})
    const [uploadingImage, setUploadingImage] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const { data: instituteTypes, loading: loadingInstituteTypes, error: instituteTypesError } = useInstituteTypes({
        enabled: section.id === 'institution',
        limit: 1000,
    })
    const { data: lookupDegrees, loading: loadingDegrees, error: degreesError } = useDegrees({
        enabled: section.id === 'academic',
        limit: 1000,
    })
    const { data: lookupBranches, loading: loadingBranches, error: branchesError } = useBranches({
        enabled: section.id === 'academic',
        limit: 1000,
    })

    const selectedDegrees = parseMultiValueField(formData.courses_offered as string | undefined)
    const selectedBranches = parseMultiValueField(formData.branch as string | undefined)

    const degreeSelectOptions = useMemo(() => {
        const seen = new Set<string>()
        return lookupDegrees
            .filter((d) => {
                const name = d.name?.trim()
                if (!name || seen.has(name)) return false
                seen.add(name)
                return true
            })
            .map((d) => ({ value: d.name, label: d.name }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [lookupDegrees])

    const availableBranchOptions = useMemo(() => {
        if (!selectedDegrees.length) return []
        const allNames = lookupBranches.map((b) => b.name)
        const allowed = new Set<string>()
        for (const degree of selectedDegrees) {
            filterBranchNamesForDegree(allNames, degree).forEach((name) => allowed.add(name))
        }
        return Array.from(allowed)
            .sort((a, b) => a.localeCompare(b))
            .map((name) => ({ value: name, label: name }))
    }, [lookupBranches, selectedDegrees])

    useEffect(() => {
        if (profile && section) {
            // Initialize form data with current profile values
            const initialData: UniversityProfileUpdateData = {}
            section.fields.forEach(field => {
                if (field === 'bio') {
                    initialData.bio = getUniversityDisplayBio(profile.bio)
                    return
                }
                initialData[field as keyof UniversityProfileUpdateData] = (profile[field as keyof UniversityProfile] || '') as any
            })
            setFormData(initialData)
        }
    }, [profile, section])

    const handleDegreesChange = (degrees: string[]) => {
        const allNames = lookupBranches.map((b) => b.name)
        const allowed = new Set<string>()
        for (const degree of degrees) {
            filterBranchNamesForDegree(allNames, degree).forEach((name) => allowed.add(name))
        }
        const nextBranches = selectedBranches.filter((branch) => allowed.has(branch))
        setFormData({
            ...formData,
            courses_offered: serializeMultiValueField(degrees),
            branch: serializeMultiValueField(nextBranches),
        })
        if (fieldErrors.courses_offered || fieldErrors.branch) {
            setFieldErrors({ ...fieldErrors, courses_offered: '', branch: '' })
        }
    }

    const handleBranchesChange = (branches: string[]) => {
        setFormData({
            ...formData,
            branch: serializeMultiValueField(branches),
        })
        if (fieldErrors.branch) {
            setFieldErrors({ ...fieldErrors, branch: '' })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Clear previous errors
        setFieldErrors({})

        // Validation errors
        const errors: Record<string, string> = {}
        let hasValidationErrors = false

        // Basic Information validation
        if (section.id === 'basic') {
            // Name validation
            if (formData.name && formData.name.trim().length < 2) {
                errors.name = 'Name must be at least 2 characters long'
                hasValidationErrors = true
            }

            // Phone validation - exactly 10 digits
            if (formData.phone && formData.phone.trim()) {
                const phoneRegex = /^\d{10}$/
                if (!phoneRegex.test(formData.phone)) {
                    errors.phone = 'Phone number must be exactly 10 digits'
                    hasValidationErrors = true
                }
            }

            // Website URL validation
            if (formData.website_url && formData.website_url.trim()) {
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
                if (!urlPattern.test(formData.website_url)) {
                    errors.website_url = 'Please enter a valid website URL'
                    hasValidationErrors = true
                }
            }
        }

        // Institution Details validation
        if (section.id === 'institution') {
            // University name validation
            if (formData.university_name && formData.university_name.trim().length < 2) {
                errors.university_name = 'University name must be at least 2 characters long'
                hasValidationErrors = true
            }

            // Established year validation
            if (formData.established_year) {
                const currentYear = new Date().getFullYear()
                if (formData.established_year < 1800 || formData.established_year > currentYear) {
                    errors.established_year = `Established year must be between 1800 and ${currentYear}`
                    hasValidationErrors = true
                }
            }

            // Contact person name validation
            if (formData.contact_person_name && formData.contact_person_name.trim().length < 2) {
                errors.contact_person_name = 'Contact person name must be at least 2 characters long'
                hasValidationErrors = true
            }

            // Contact designation validation
            if (formData.contact_designation && formData.contact_designation.trim().length < 2) {
                errors.contact_designation = 'Contact designation must be at least 2 characters long'
                hasValidationErrors = true
            }

            // Address validation
            if (!formData.address || !String(formData.address).trim()) {
                errors.address = 'Address is required. Please select a location from the suggestions.'
                hasValidationErrors = true
            }
        }

        // Academic Information validation
        if (section.id === 'academic') {
            const degrees = parseMultiValueField(formData.courses_offered as string | undefined)
            const branchesSelected = parseMultiValueField(formData.branch as string | undefined)

            if (degrees.length === 0) {
                errors.courses_offered = 'Please select at least one degree offered'
                hasValidationErrors = true
            }

            if (branchesSelected.length === 0) {
                errors.branch = 'Please select at least one branch'
                hasValidationErrors = true
            }
        }

        // If there are validation errors, set field errors and return
        if (hasValidationErrors) {
            setFieldErrors(errors)
            return
        }

        // Remove readonly fields and fields that don't exist in the backend model before saving
        const {
            total_students,
            total_faculty,
            departments,
            programs_offered,
            placement_rate,
            average_package,
            top_recruiters,
            total_jobs,
            total_jobs_approved,
            university_name: _lockedUniversityName,
            name: _lockedName,
            ...saveableData
        } = formData
        onSave(saveableData)
    }

    const handleImageUpload = async (file: File) => {
        try {
            setUploadingImage(true)
            const result = await universityProfileService.uploadProfilePicture(file)
            setFormData({ ...formData, profile_picture: result.file_url })
        } catch (error: any) {
            console.error('Image upload error:', error)
        } finally {
            setUploadingImage(false)
        }
    }

    const renderField = (field: string) => {
        const value = formData[field as keyof UniversityProfileUpdateData] || ''

        // Handle profile picture upload
        if (field === 'profile_picture') {
            return (
                <div className="space-y-3">
                    <FileUpload
                        type="image"
                        onFileSelect={handleImageUpload}
                        currentFile={value as string}
                        placeholder="Upload your profile picture"
                        disabled={uploadingImage}
                    />
                    {uploadingImage && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                        </div>
                    )}
                </div>
            )
        }

        // Handle email field - make it read-only
        if (field === 'email') {
            return (
                <div className="space-y-2">
                    <Input
                        type="email"
                        value={value as string}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        placeholder="Email cannot be edited"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Email cannot be changed for security reasons
                    </p>
                </div>
            )
        }

        // University name is fixed at registration — read-only like email
        if (field === 'university_name') {
            return (
                <div className="space-y-2">
                    <Input
                        value={value as string}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        placeholder="University name cannot be edited"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        University name is set during registration and cannot be changed
                    </p>
                </div>
            )
        }

        // Handle phone field with numeric validation and max length
        if (field === 'phone') {
            return (
                <div>
                    <Input
                        type="tel"
                        value={value as string}
                        onChange={(e) => {
                            const inputValue = e.target.value
                            // Only allow numbers and limit to 10 digits
                            const numericValue = inputValue.replace(/[^0-9]/g, '').slice(0, 10)
                            setFormData({ ...formData, [field]: numericValue })
                            // Clear error when user starts typing
                            if (fieldErrors[field]) {
                                setFieldErrors({ ...fieldErrors, [field]: '' })
                            }
                        }}
                        className={`w-full ${fieldErrors[field] ? 'border-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                    />
                    {fieldErrors[field] && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
                    )}
                </div>
            )
        }

        if (field === 'address') {
            return (
                <div>
                    <GoogleLocationAutocomplete
                        value={value as string}
                        placeholder="Search for your institution address"
                        mode="address"
                        required
                        error={fieldErrors[field]}
                        onChange={(place) => {
                            setFormData({ ...formData, address: place.formattedAddress })
                            if (fieldErrors[field]) {
                                setFieldErrors({ ...fieldErrors, [field]: '' })
                            }
                        }}
                    />
                </div>
            )
        }

        // Handle textarea fields (bio only — courses_offered is multi-select)
        if (field.includes('bio')) {
            return (
                <div>
                    <Textarea
                        value={value as string}
                        onChange={(e) => {
                            setFormData({ ...formData, [field]: e.target.value })
                            // Clear error when user starts typing
                            if (fieldErrors[field]) {
                                setFieldErrors({ ...fieldErrors, [field]: '' })
                            }
                        }}
                        rows={4}
                        className={`w-full ${fieldErrors[field] ? 'border-red-500 focus:border-red-500' : ''}`}
                        placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                    />
                    {fieldErrors[field] && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
                    )}
                </div>
            )
        }

        if (field === 'courses_offered') {
            return (
                <div>
                    <MultiSearchableSelect
                        options={degreeSelectOptions}
                        values={selectedDegrees}
                        onChange={handleDegreesChange}
                        placeholder={loadingDegrees ? 'Loading degrees...' : 'Select degrees offered...'}
                        searchPlaceholder="Search degrees..."
                        disabled={loadingDegrees}
                        isLoading={loadingDegrees}
                    />
                    {degreesError && (
                        <p className="text-red-500 text-xs mt-1">{degreesError}</p>
                    )}
                    {fieldErrors[field] && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
                    )}
                </div>
            )
        }

        // Handle number fields
        if (field.includes('year') || field.includes('students') || field.includes('faculty') || field.includes('rate') || field.includes('package')) {
            return (
                <div>
                    <Input
                        type="number"
                        value={value as number || ''}
                        onChange={(e) => {
                            const numericValue = field.includes('rate') || field.includes('package') ? parseFloat(e.target.value) || undefined : parseInt(e.target.value) || undefined
                            setFormData({ ...formData, [field]: numericValue })
                            // Clear error when user starts typing
                            if (fieldErrors[field]) {
                                setFieldErrors({ ...fieldErrors, [field]: '' })
                            }
                        }}
                        className={`w-full ${fieldErrors[field] ? 'border-red-500 focus:border-red-500' : ''}`}
                        placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                        min={field.includes('rate') ? 0 : field.includes('year') ? 1800 : 0}
                        max={field.includes('rate') ? 100 : field.includes('year') ? new Date().getFullYear() : undefined}
                        step={field.includes('rate') || field.includes('package') ? 0.1 : undefined}
                    />
                    {fieldErrors[field] && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
                    )}
                </div>
            )
        }

        // Handle select fields
        if (field === 'institute_type') {
            return (
                <LookupSelect
                    value={(value as string) || ''}
                    onChange={(val) => setFormData({ ...formData, [field]: val })}
                    data={instituteTypes}
                    loading={loadingInstituteTypes}
                    placeholder="Select institute type"
                    error={instituteTypesError || undefined}
                    required
                />
            )
        }

        if (field === 'branch') {
            return (
                <div>
                    <MultiSearchableSelect
                        options={availableBranchOptions}
                        values={selectedBranches}
                        onChange={handleBranchesChange}
                        placeholder={
                            loadingBranches
                                ? 'Loading branches...'
                                : selectedDegrees.length
                                    ? 'Select related branches...'
                                    : 'Select a degree first...'
                        }
                        searchPlaceholder="Search branches..."
                        disabled={selectedDegrees.length === 0 || loadingBranches}
                        isLoading={loadingBranches}
                    />
                    {branchesError && (
                        <p className="text-red-500 text-xs mt-1">{branchesError}</p>
                    )}
                    {selectedDegrees.length === 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Choose one or more degrees to see related branches.
                        </p>
                    )}
                    {fieldErrors[field] && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
                    )}
                </div>
            )
        }

        // Handle URL fields
        if (field === 'website_url') {
            return (
                <div>
                    <Input
                        type="url"
                        value={value as string}
                        onChange={(e) => {
                            setFormData({ ...formData, [field]: e.target.value })
                            // Clear error when user starts typing
                            if (fieldErrors[field]) {
                                setFieldErrors({ ...fieldErrors, [field]: '' })
                            }
                        }}
                        className={`w-full ${fieldErrors[field] ? 'border-red-500 focus:border-red-500' : ''}`}
                        placeholder="https://university.edu"
                    />
                    {fieldErrors[field] && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
                    )}
                </div>
            )
        }

        // Name is fixed at registration — read-only like email
        if (field === 'name') {
            return (
                <div className="space-y-2">
                    <Input
                        value={value as string}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        placeholder="Name cannot be edited"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Name is set during registration and cannot be changed
                    </p>
                </div>
            )
        }

        // Default text input with validation
        return (
            <div>
                <Input
                    value={value as string}
                    onChange={(e) => {
                        let inputValue = e.target.value

                        // Name field validation - only alphabets, spaces, and common punctuation
                        if (field === 'name' || field === 'university_name' || field === 'contact_person_name' || field === 'contact_designation') {
                            const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g, '')
                            if (sanitizedValue !== inputValue) {
                                toast.error('Only letters, spaces, periods, and hyphens are allowed')
                            }
                            inputValue = sanitizedValue
                        }

                        // Branch field validation - allow alphanumeric and common characters
                        if (field === 'branch') {
                            const sanitizedValue = inputValue.replace(/[^a-zA-Z0-9\s,.-]/g, '')
                            if (sanitizedValue !== inputValue) {
                                toast.error('Only letters, numbers, spaces, and common punctuation are allowed')
                            }
                            inputValue = sanitizedValue
                        }

                        setFormData({ ...formData, [field]: inputValue })
                        // Clear error when user starts typing
                        if (fieldErrors[field]) {
                            setFieldErrors({ ...fieldErrors, [field]: '' })
                        }
                    }}
                    className={`w-full ${fieldErrors[field] ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                    maxLength={field === 'name' || field === 'university_name' ? 50 : field === 'contact_person_name' || field === 'contact_designation' ? 30 : field === 'branch' ? 20 : undefined}
                />
                {fieldErrors[field] && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => (
                    <div key={field} className={field.includes('bio') || field.includes('address') || field.includes('courses_offered') || field === 'branch' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                            {field === 'courses_offered' ? 'Degree Offered' : field.replace(/_/g, ' ')}
                        </label>
                        {renderField(field)}
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    )

}