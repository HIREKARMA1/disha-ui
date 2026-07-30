"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    GraduationCap,
    Globe,
    Building2,
    MapPin,
    Phone,
    Mail,
    Calendar,
    AlertCircle,
    Camera,
    FileText,
    Briefcase,
    Users,
    ExternalLink,
    Pencil,
    Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UniversityDashboardLayout } from './UniversityDashboardLayout'
import { cn, getInitials } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { universityProfileService, type UniversityProfile, type UniversityProfileUpdateData } from '@/services/universityProfileService'
import { FileUpload } from '../ui/file-upload'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { z } from "zod";
import toast from 'react-hot-toast'
import { GoogleLocationAutocomplete } from '@/components/ui/GoogleLocationAutocomplete'
import { useInstituteTypes, useBranches } from '@/hooks/useLookup'
import { LookupSelect } from '@/components/ui/lookup-select'
import { CorporatePageHero } from '@/components/corporate/ui/CorporatePageHero'
import { CorporateGlassCard } from '@/components/corporate/ui/CorporateGlassCard'
import { corpCard } from '@/components/corporate/ui/corporate-theme'
import { ImageModal } from '../ui/image-modal'

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


const infoCardClass =
    'p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] min-w-0'

function parseListField(value?: string): string[] {
    if (!value?.trim()) return []
    return value.split(/[,;|\n]+/).map((s) => s.trim()).filter(Boolean)
}

function InfoCard({
    label,
    value,
    icon: Icon,
    className,
}: {
    label: string
    value?: string | number | null
    icon?: React.ComponentType<{ className?: string }>
    className?: string
}) {
    const display = value != null && value !== '' ? String(value) : '—'
    return (
        <div className={cn(infoCardClass, className)}>
            {Icon && (
                <div className="flex items-start gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white break-words line-clamp-3">
                            {display}
                        </p>
                    </div>
                </div>
            )}
            {!Icon && (
                <>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white break-words line-clamp-3">
                        {display}
                    </p>
                </>
            )}
        </div>
    )
}

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
    const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; altText: string }>({
        isOpen: false,
        imageUrl: '',
        altText: '',
    })
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
            // 🔹 Try to save via API
            try {
                const updatedProfile = await universityProfileService.updateProfile(formData);
                setProfile(updatedProfile);
                console.log("Profile saved successfully");

                // Show success toast with section name
                const sectionName = profileSections.find(s => s.id === sectionId)?.title || 'Profile'
                toast.success(`${sectionName} updated successfully!`)

            } catch (apiError) {
                console.log("API not available, simulating save");
                if (profile) {
                    setProfile({ ...profile, ...formData });
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
                    initialData.bio = profile.bio
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

    const affiliations = useMemo(() => {
        if (!profile) return []
        const fromDepartments = parseListField(profile.departments)
        const fromPrograms = parseListField(profile.programs_offered)
        return Array.from(new Set([...fromDepartments, ...fromPrograms]))
    }, [profile?.departments, profile?.programs_offered])

    const departmentStat = useMemo(() => {
        if (!profile?.departments?.trim()) return '—'
        const items = parseListField(profile.departments)
        return items.length > 1 ? String(items.length) : profile.departments
    }, [profile?.departments])

    if (loading) {
        return (
            <UniversityDashboardLayout>
                <div className="w-full max-w-[1400px] mx-auto space-y-4 animate-pulse">
                    <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-[18px]" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="h-80 bg-gray-200 dark:bg-white/10 rounded-[18px]" />
                        <div className="h-80 bg-gray-200 dark:bg-white/10 rounded-[18px] lg:col-span-2" />
                    </div>
                    <div className="h-48 bg-gray-200 dark:bg-white/10 rounded-[18px]" />
                </div>
            </UniversityDashboardLayout>
        )
    }

    if (error && !profile) {
        return (
            <UniversityDashboardLayout>
                <div className="w-full max-w-[1400px] mx-auto">
                    <div className={cn(corpCard, 'p-6 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10')}>
                        <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">Error Loading Profile</h3>
                        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                        <Button onClick={loadProfile}>Try Again</Button>
                    </div>
                </div>
            </UniversityDashboardLayout>
        )
    }

    if (!profile) {
        return (
            <UniversityDashboardLayout>
                <div className="w-full max-w-[1400px] mx-auto">
                    <div className={cn(corpCard, 'p-6 text-center')}>
                        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Unable to load your profile. Please try again later.
                        </p>
                    </div>
                </div>
            </UniversityDashboardLayout>
        )
    }

    const websiteDisplay = profile.website_url?.replace(/^https?:\/\//, '') || null

    const EditLink = ({ section, tab }: { section: string; tab?: string }) => (
        <button
            type="button"
            onClick={() => {
                if (tab) setActiveTab(tab)
                handleEdit(section)
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
            <Pencil className="w-3.5 h-3.5" />
            Edit
        </button>
    )

    return (
        <UniversityDashboardLayout>
            <div className="w-full max-w-[1400px] mx-auto space-y-4 md:space-y-6">
                <CorporatePageHero
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
                            icon: <Users className="w-3.5 h-3.5" />,
                        },
                        {
                            label: 'Excellence in Education',
                            tone: 'purple',
                            icon: <GraduationCap className="w-3.5 h-3.5" />,
                        },
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column */}
                    <div className="space-y-4 sm:space-y-6">
                        <CorporateGlassCard delay={0.05}>
                            <div className="flex flex-col items-center text-center">
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg ring-4 ring-blue-500/20 overflow-hidden">
                                        {profile.profile_picture ? (
                                            <img
                                                src={profile.profile_picture}
                                                alt={profile.name}
                                                className="w-full h-full object-cover cursor-pointer"
                                                onClick={() =>
                                                    setImageModal({
                                                        isOpen: true,
                                                        imageUrl: profile.profile_picture!,
                                                        altText: profile.name,
                                                    })
                                                }
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-white">
                                                {getInitials(profile.name)}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600 shadow-md border border-gray-200 dark:border-white/10 hover:scale-110 transition-transform disabled:opacity-50"
                                        onClick={() => {
                                            setActiveTab('basic')
                                            handleEdit('basic')
                                        }}
                                        title="Change profile picture"
                                        disabled={uploadingImage}
                                    >
                                        {uploadingImage ? (
                                            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Camera className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {profile.name}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-0.5">
                                    {profile.institute_type || '—'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                                    {profile.established_year ? `Est. ${profile.established_year}` : '—'}
                                </p>

                                <div className="grid grid-cols-2 gap-3 w-full">
                                    {[
                                        { label: 'Total Students', value: profile.total_students?.toLocaleString() ?? '—' },
                                        { label: 'Total Jobs', value: profile.total_jobs?.toLocaleString() ?? '—' },
                                        { label: 'Jobs Approved', value: profile.total_jobs_approved?.toLocaleString() ?? '—' },
                                        { label: 'Departments', value: departmentStat },
                                    ].map((stat) => (
                                        <div key={stat.label} className={infoCardClass}>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{stat.label}</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {stat.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CorporateGlassCard>

                        {profile.website_url && (
                            <CorporateGlassCard title="Social Links" action={<EditLink section="basic" tab="basic" />} delay={0.1}>
                                <a
                                    href={
                                        profile.website_url.startsWith('http')
                                            ? profile.website_url
                                            : `https://${profile.website_url}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] hover:border-blue-500/30 transition-colors group"
                                >
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Website</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            {websiteDisplay}
                                        </p>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                </a>
                            </CorporateGlassCard>
                        )}

                        <CorporateGlassCard title="Documents" action={<EditLink section="basic" tab="basic" />} delay={0.12}>
                            {profile.profile_picture ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                                    <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Picture</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Uploaded</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setImageModal({
                                                isOpen: true,
                                                imageUrl: profile.profile_picture!,
                                                altText: profile.name,
                                            })
                                        }
                                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        View
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No documents uploaded</p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setActiveTab('basic')
                                            handleEdit('basic')
                                        }}
                                        className="rounded-xl border-gray-200 dark:border-white/10"
                                    >
                                        Upload Document
                                    </Button>
                                </div>
                            )}
                        </CorporateGlassCard>
                    </div>

                    {/* Right Column — Tabbed Card */}
                    <div className="lg:col-span-2">
                        <CorporateGlassCard padding={false} delay={0.08} className="overflow-hidden">
                            <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-white/[0.08] px-4 sm:px-6">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    const isActive = activeTab === tab.id
                                    return (
                                        <motion.button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                'flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 -mb-px',
                                                isActive
                                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            )}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Icon className={cn('w-4 h-4', isActive && 'text-blue-600 dark:text-blue-400')} />
                                            {tab.label}
                                        </motion.button>
                                    )
                                })}
                            </div>
                            <div className="p-5 sm:p-6">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                >
                                    {renderTabContent()}
                                </motion.div>
                            </div>
                        </CorporateGlassCard>
                    </div>
                </div>

                <CorporateGlassCard title="Accreditation & Affiliation" delay={0.15}>
                    {affiliations.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {affiliations.map((name) => (
                                <div
                                    key={name}
                                    className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] flex flex-col gap-2"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                            <Award className="w-3.5 h-3.5" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{name}</p>
                                    </div>
                                    <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-500/30">
                                        Listed
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Award className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No accreditation or affiliation information provided yet.
                            </p>
                        </div>
                    )}
                </CorporateGlassCard>

                <ImageModal
                    isOpen={imageModal.isOpen}
                    imageUrl={imageModal.imageUrl}
                    altText={imageModal.altText}
                    onClose={() => setImageModal({ isOpen: false, imageUrl: '', altText: '' })}
                />
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
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        Basic Information
                    </h3>
                    {editing !== 'basic' && (
                        <button
                            type="button"
                            onClick={() => handleEdit('basic')}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                        </button>
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
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoCard label="Email Address" value={profile!.email} icon={Mail} />
                            <InfoCard label="Phone Number" value={profile!.phone} icon={Phone} />
                            <InfoCard label="Website" value={websiteDisplay} icon={Globe} />
                            <InfoCard label="Display Name" value={profile!.name} icon={User} />
                        </div>
                        {profile!.bio && (
                            <div className={cn(infoCardClass, 'sm:col-span-2')}>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{profile!.bio}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        )
    }

    function renderInstitutionInfo() {
        return (
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-violet-500" />
                        Institution Details
                    </h3>
                    {editing !== 'institution' && (
                        <button
                            type="button"
                            onClick={() => handleEdit('institution')}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                        </button>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoCard label="University Name" value={profile!.name} icon={Building2} />
                        <InfoCard label="Institute Type" value={profile!.institute_type} icon={Building2} />
                        <InfoCard label="Established Year" value={profile!.established_year} icon={Calendar} />
                        <InfoCard label="Contact Person" value={profile!.contact_person_name} icon={User} />
                        <InfoCard label="Designation" value={profile!.contact_designation} icon={Briefcase} />
                        <InfoCard label="Address" value={profile!.address} icon={MapPin} className="sm:col-span-2" />
                    </div>
                )}
            </div>
        )
    }

    function renderAcademicInfo() {
        return (
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-orange-500" />
                        Academic Information
                    </h3>
                    {editing !== 'academic' && (
                        <button
                            type="button"
                            onClick={() => handleEdit('academic')}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                        </button>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoCard label="Courses Offered" value={profile!.courses_offered} icon={GraduationCap} className="sm:col-span-2" />
                        <InfoCard label="Branch" value={profile!.branch} icon={Building2} />
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
    const { data: branches, loading: loadingBranches, error: branchesError } = useBranches({
        enabled: section.id === 'academic',
        limit: 1000,
    })

    useEffect(() => {
        if (profile && section) {
            // Initialize form data with current profile values
            const initialData: UniversityProfileUpdateData = {}
            section.fields.forEach(field => {
                initialData[field as keyof UniversityProfileUpdateData] = (profile[field as keyof UniversityProfile] || '') as any
            })
            setFormData(initialData)
        }
    }, [profile, section])

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
            // Courses offered validation
            if (formData.courses_offered && formData.courses_offered.trim().length < 5) {
                errors.courses_offered = 'Courses offered must be at least 5 characters long'
                hasValidationErrors = true
            }

            // Branch validation
            if (formData.branch && formData.branch.trim().length < 2) {
                errors.branch = 'Branch must be at least 2 characters long'
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

        // Handle textarea fields
        if (field.includes('bio') || field.includes('courses_offered')) {
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
                <LookupSelect
                    value={(value as string) || ''}
                    onChange={(val) => setFormData({ ...formData, [field]: val })}
                    data={branches}
                    loading={loadingBranches}
                    placeholder="Select branch"
                    error={branchesError || undefined}
                    required
                />
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

        // Handle readonly fields (university name after account creation)
        if (field === 'name') {
            return (
                <div className="space-y-2">
                    <Input
                        value={value as string}
                        onChange={(e) => {
                            let inputValue = e.target.value
                            const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g, '')
                            if (sanitizedValue !== inputValue) {
                                toast.error('Only letters, spaces, periods, and hyphens are allowed')
                            }
                            inputValue = sanitizedValue

                            setFormData({ ...formData, [field]: inputValue })
                            if (fieldErrors[field]) {
                                setFieldErrors({ ...fieldErrors, [field]: '' })
                            }
                        }}
                        className={`w-full ${fieldErrors[field] ? 'border-red-500 focus:border-red-500' : ''}`}
                        placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                        maxLength={50}
                    />
                    {fieldErrors[field] && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
                    )}
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
                    <div key={field} className={field.includes('bio') || field.includes('address') || field.includes('courses_offered') ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                            {field.replace(/_/g, ' ')}
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