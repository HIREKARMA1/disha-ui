"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    GraduationCap,
    Globe,
    Zap,
    Shield,
    Trophy,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Camera,
    FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentSidebar } from './StudentSidebar'
import { Navbar } from '../ui/navbar'
import { ProfileCompletion } from '../ui/profile-completion'
import { FileUpload } from '../ui/file-upload'
import { ImageModal } from '../ui/image-modal'
import { SingleBranchSelection } from '../ui/SingleBranchSelection'
import { cn, getInitials, truncateText } from '@/lib/utils'
import { profileService, type StudentProfile, type ProfileUpdateData, type ProfileCompletionResponse } from '@/services/profileService'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { useBranches, useDegrees, useUniversities } from '@/hooks/useLookup'
import { LookupSelect } from '@/components/ui/lookup-select'

interface ProfileSection {
    id: string
    title: string
    icon: any
    fields: string[]
    completed: boolean
}

export function StudentProfile() {
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionResponse | null>(null)
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
            fields: ['name', 'email', 'phone', 'dob', 'gender', 'country', 'state', 'city', 'institution', 'bio', 'profile_picture'],
            completed: false
        },
        {
            id: 'academic',
            title: 'Academic Information',
            icon: GraduationCap,
            fields: ['institution', 'degree', 'branch', 'graduation_year', 'btech_cgpa', 'twelfth_institution', 'twelfth_stream', 'twelfth_year', 'twelfth_grade_percentage', 'tenth_institution', 'tenth_stream', 'tenth_year', 'tenth_grade_percentage'],
            completed: false
        },
        {
            id: 'skills',
            title: 'Skills & Interests',
            icon: Zap,
            fields: ['technical_skills', 'soft_skills', 'certifications', 'preferred_industry', 'job_roles_of_interest', 'location_preferences'],
            completed: false
        },
        {
            id: 'experience',
            title: 'Experience & Projects',
            icon: Trophy,
            fields: ['internship_experience', 'project_details', 'extracurricular_activities'],
            completed: false
        },
        {
            id: 'documents',
            title: 'Documents & Certificates',
            icon: Shield,
            fields: ['resume', '10th_certificate', '12th_certificate', 'internship_certificates'],
            completed: false
        },
        {
            id: 'social',
            title: 'Social Profiles',
            icon: Globe,
            fields: ['linkedin_profile', 'github_profile', 'personal_website'],
            completed: false
        }
    ]

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User },
        { id: 'academic', label: 'Academic', icon: GraduationCap },
        { id: 'skills', label: 'Skills', icon: Zap },
        { id: 'experience', label: 'Experience', icon: Trophy },
        { id: 'documents', label: 'Documents', icon: Shield },
        { id: 'social', label: 'Social', icon: Globe }
    ]

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch both profile and completion data in parallel
            const [profileData, completionData] = await Promise.all([
                profileService.getProfile(),
                profileService.getProfileCompletion()
            ])

            setProfile(profileData)
            setProfileCompletion(completionData)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

const handleSave = async (sectionId: string, formData: ProfileUpdateData) => {
    try {
        setSaving(true)
        setError(null)

        console.log('Saving profile data for section:', sectionId)
        console.log('Form data being sent:', formData)

        const updatedProfile = await profileService.updateProfile(formData)
        console.log('Profile updated successfully:', updatedProfile)

        setProfile(updatedProfile)

        // Refresh completion data after profile update
        const completionData = await profileService.getProfileCompletion()
        setProfileCompletion(completionData)

        setEditing(null)
        
        // Only show success toast if there were actual changes
        // The form validation already ensures we only get here if there are changes
        const sectionName = profileSections.find(s => s.id === sectionId)?.title || 'Profile'
        toast.success(`${sectionName} updated successfully!`)

    } catch (error: any) {
        console.error('Error saving profile:', error)
        setError(error.message)

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
        setSaving(false)
    }
}

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <StudentSidebar />
                <div className="pt-16 lg:pl-64">
                    <main className="flex-1 p-4 lg:p-6">
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
                    </main>
                </div>
            </div>
        )
    }

    if (error && !profile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex">
                    <StudentSidebar />
                    <main className="flex-1 p-4 lg:p-6">
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
                    </main>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex">
                    <StudentSidebar />
                    <main className="flex-1 p-4 lg:p-6">
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
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <StudentSidebar />
            <div className="pt-16 lg:pl-64">
                <main className="flex-1 p-4 lg:p-6">
                    <div className="w-full">
                        {/* Header - Consistent with other sections */}
                        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        Student Profile 👤
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                        Manage your personal information and career details ✨
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                            📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                            📈 Career Growth
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                            🚀 New Opportunities
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
                                                    {profile.institution || 'University Student'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {profile.degree} • {profile.branch}
                                                </p>
                                            </div>

                                            {/* Profile Stats */}
                                            <div className="flex-1">
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
                                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
                                                        <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Email</span>
                                                        {(profile.email_verified || !!profile.email) ? (
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
                                                        {(profile.phone_verified || !!profile.phone) ? (
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
                                                        <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Photo</span>
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
                                                        <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Resume</span>
                                                        {profile.resume ? (
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

                                {/* Profile Completion Card */}
                                <div className="xl:col-span-1">
                                    <ProfileCompletion
                                        completion={profileCompletion?.completion_percentage || profile?.profile_completion_percentage || 0}
                                        completionData={profileCompletion || undefined}
                                    />
                                </div>

                                {/* Tab-based Profile Sections */}
                                <div className="xl:col-span-3">
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
                                                        section={{ id: 'basic', title: 'Basic Information', icon: User, fields: ['name', 'email', 'phone', 'dob', 'gender', 'country', 'state', 'city', 'bio', 'profile_picture'], completed: false }}
                                                        profile={profile}
                                                        onSave={(formData) => handleSave('basic', formData)}
                                                        saving={saving}
                                                        onCancel={() => setEditing(null)}
                                                    />
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                            <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                Personal Details
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {profile.name || 'Name not provided'}
                                                            </div>
                                                            {profile.dob && (
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                    Date of Birth: {new Date(profile.dob).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                            {profile.gender && (
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                    Gender: {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                                                                </div>
                                                            )}
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

                                                        {(profile.country || profile.state || profile.city) && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    Location
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Location not provided'}
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

                                                        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                            <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                Profile Picture
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    {profile.profile_picture ? (
                                                                        <>
                                                                            <img
                                                                                src={profile.profile_picture}
                                                                                alt="Profile"
                                                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                                                            />
                                                                            <span className="text-sm text-green-600 dark:text-green-400">✓ Uploaded</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-sm text-gray-500 dark:text-gray-400">✗ Not uploaded</span>
                                                                    )}
                                                                </div>
                                                                {profile.profile_picture && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => profile.profile_picture && setImageModal({
                                                                            isOpen: true,
                                                                            imageUrl: profile.profile_picture,
                                                                            altText: 'Profile Picture'
                                                                        })}
                                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                                    >
                                                                        <Camera className="w-4 h-4 mr-2" />
                                                                        View Image
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'academic' && (
                                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                                                            <GraduationCap className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Academic Information</h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Educational background and achievements</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditing('academic')}
                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/80 dark:text-emerald-400 dark:hover:bg-emerald-900/20 text-xs transition-all duration-200"
                                                    >
                                                        <ChevronRight className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </div>

                                                {editing === 'academic' ? (
                                                    <ProfileSectionForm
                                                        section={{ id: 'academic', title: 'Academic Information', icon: GraduationCap, fields: ['institution', 'degree', 'branch', 'graduation_year', 'btech_cgpa', 'twelfth_institution', 'twelfth_stream', 'twelfth_year', 'twelfth_grade_percentage', 'tenth_institution', 'tenth_stream', 'tenth_year', 'tenth_grade_percentage'], completed: false }}
                                                        profile={profile}
                                                        onSave={(formData) => handleSave('academic', formData)}
                                                        saving={saving}
                                                        onCancel={() => setEditing(null)}
                                                    />
                                                ) : (
                                                    <div className="space-y-6">
                                                        {/* College Section */}
                                                        <div className="p-6 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
                                                            <div className="flex items-center space-x-3 mb-4">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                                                    <GraduationCap className="w-4 h-4 text-white" />
                                                                </div>
                                                                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">College</h3>
                                                            </div>

                                                            {profile.institution && profile.degree && profile.branch ? (
                                                                <div className="space-y-3">
                                                                    <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-emerald-200/30 dark:border-emerald-600/30">
                                                                        <div className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                                                                            {profile.degree} from {profile.institution}
                                                                        </div>
                                                                        <div className="text-sm text-emerald-700 dark:text-emerald-300">
                                                                            {profile.branch} • {profile.graduation_year ? `Graduating in ${profile.graduation_year}` : 'Graduation year not specified'}
                                                                        </div>
                                                                    </div>

                                                                    {profile.btech_cgpa && (
                                                                        <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-emerald-200/30 dark:border-emerald-600/30">
                                                                            <div className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                                                                                CGPA
                                                                            </div>
                                                                            <div className="text-sm text-emerald-700 dark:text-emerald-300">
                                                                                {profile.btech_cgpa}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-emerald-200/30 dark:border-emerald-600/30">
                                                                    <div className="text-sm text-emerald-700 dark:text-emerald-300">
                                                                        No college details provided yet
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* 12th Section */}
                                                        <div className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                                                            <div className="flex items-center space-x-3 mb-4">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                    </svg>
                                                                </div>
                                                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Class XII</h3>
                                                            </div>

                                                            {profile.twelfth_grade_percentage ? (
                                                                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200/30 dark:border-blue-600/30">
                                                                    <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                                                        Percentage
                                                                    </div>
                                                                    <div className="text-sm text-blue-700 dark:text-blue-300">
                                                                        {profile.twelfth_grade_percentage}%
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200/30 dark:border-blue-600/30">
                                                                    <div className="text-sm text-blue-700 dark:text-blue-300">
                                                                        No Class XII details provided yet
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* 10th Section */}
                                                        <div className="p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                                                            <div className="flex items-center space-x-3 mb-4">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                    </svg>
                                                                </div>
                                                                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Class X</h3>
                                                            </div>

                                                            {profile.tenth_grade_percentage ? (
                                                                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200/30 dark:border-purple-600/30">
                                                                    <div className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                                                                        Percentage
                                                                    </div>
                                                                    <div className="text-sm text-purple-700 dark:text-purple-300">
                                                                        {profile.tenth_grade_percentage}%
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200/30 dark:border-purple-600/30">
                                                                    <div className="text-sm text-purple-700 dark:text-purple-300">
                                                                        No Class X details provided yet
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'skills' && (
                                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                                                            <Zap className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Skills & Interests</h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Technical skills, soft skills, and career preferences</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditing('skills')}
                                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50/80 dark:text-amber-400 dark:hover:bg-amber-900/20 text-xs transition-all duration-200"
                                                    >
                                                        <ChevronRight className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </div>

                                                {editing === 'skills' ? (
                                                    <ProfileSectionForm
                                                        section={{ id: 'skills', title: 'Skills & Interests', icon: Zap, fields: ['technical_skills', 'soft_skills', 'certifications', 'preferred_industry', 'job_roles_of_interest', 'location_preferences'], completed: false }}
                                                        profile={profile}
                                                        onSave={(formData) => handleSave('skills', formData)}
                                                        saving={saving}
                                                        onCancel={() => setEditing(null)}
                                                    />
                                                ) : (
                                                    <div className="space-y-4">
                                                        {profile.technical_skills && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    Technical Skills
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {profile.technical_skills}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {profile.soft_skills && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    Soft Skills
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {profile.soft_skills}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {profile.certifications && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    Certifications
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {profile.certifications}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {profile.preferred_industry && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    Preferred Industry
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {profile.preferred_industry}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {profile.job_roles_of_interest && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    Job Roles Of Interest
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {profile.job_roles_of_interest}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {profile.location_preferences && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    Location Preferences
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {profile.location_preferences}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!profile.technical_skills && !profile.soft_skills && !profile.certifications && !profile.preferred_industry && !profile.job_roles_of_interest && !profile.location_preferences && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    Skills & Interests
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    No skills or interests provided yet
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'experience' && (
                                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                                                            <Trophy className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Experience & Projects</h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Internships, projects, and extracurricular activities</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditing('experience')}
                                                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50/80 dark:text-purple-400 dark:hover:bg-purple-900/20 text-xs transition-all duration-200"
                                                    >
                                                        <ChevronRight className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </div>

                                                {editing === 'experience' ? (
                                                    <ProfileSectionForm
                                                        section={{ id: 'experience', title: 'Experience & Projects', icon: Trophy, fields: ['internship_experience', 'project_details', 'extracurricular_activities'], completed: false }}
                                                        profile={profile}
                                                        onSave={(formData) => handleSave('experience', formData)}
                                                        saving={saving}
                                                        onCancel={() => setEditing(null)}
                                                    />
                                                ) : (
                                                    <div className="space-y-4">
                                                        {profile.internship_experience && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="flex items-start space-x-3">
                                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                                                                            Internship Experience
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {profile.internship_experience}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {profile.project_details && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="flex items-start space-x-3">
                                                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                                                                            Project Details
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {profile.project_details}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {profile.extracurricular_activities && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="flex items-start space-x-3">
                                                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                                                                            Extracurricular Activities
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {profile.extracurricular_activities}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!profile.internship_experience && !profile.project_details && !profile.extracurricular_activities && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="flex items-start space-x-3">
                                                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                                                                            Experience & Projects
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            No experience or projects provided yet
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'documents' && (
                                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-sm">
                                                            <Shield className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Documents & Certificates</h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Resume, certificates, and important documents</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditing('documents')}
                                                        className="text-slate-600 hover:text-slate-700 hover:bg-slate-50/80 dark:text-slate-400 dark:hover:bg-slate-900/20 text-xs transition-all duration-200"
                                                    >
                                                        <ChevronRight className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </div>

                                                {editing === 'documents' ? (
                                                    <ProfileSectionForm
                                                        section={{ id: 'documents', title: 'Documents & Certificates', icon: Shield, fields: ['resume', '10th_certificate', '12th_certificate', 'internship_certificates'], completed: false }}
                                                        profile={profile}
                                                        onSave={(formData) => handleSave('documents', formData)}
                                                        saving={saving}
                                                        onCancel={() => setEditing(null)}
                                                    />
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                            <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                Resume
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    {profile.resume ? (
                                                                        <>
                                                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                                                                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                                            </div>
                                                                            <span className="text-sm text-green-600 dark:text-green-400">✓ Uploaded</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-sm text-gray-500 dark:text-gray-400">✗ Not uploaded</span>
                                                                    )}
                                                                </div>
                                                                {profile.resume && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => window.open(profile.resume, '_blank')}
                                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                                    >
                                                                        <FileText className="w-4 h-4 mr-2" />
                                                                        View File
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                            <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                Academic Certificates
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-3">
                                                                        <span className="text-sm text-gray-600 dark:text-gray-400">10th Certificate:</span>
                                                                        {profile.tenth_certificate ? (
                                                                            <span className="text-sm text-green-600 dark:text-green-400">✓ Uploaded</span>
                                                                        ) : (
                                                                            <span className="text-sm text-gray-500 dark:text-gray-400">✗ Not uploaded</span>
                                                                        )}
                                                                    </div>
                                                                    {profile.tenth_certificate && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => window.open(profile.tenth_certificate, '_blank')}
                                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                                        >
                                                                            <FileText className="w-4 h-4 mr-2" />
                                                                            View File
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-3">
                                                                        <span className="text-sm text-gray-600 dark:text-gray-400">12th Certificate:</span>
                                                                        {profile.twelfth_certificate ? (
                                                                            <span className="text-sm text-green-600 dark:text-green-400">✓ Uploaded</span>
                                                                        ) : (
                                                                            <span className="text-sm text-gray-500 dark:text-gray-400">✗ Not uploaded</span>
                                                                        )}
                                                                    </div>
                                                                    {profile.twelfth_certificate && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => window.open(profile.twelfth_certificate, '_blank')}
                                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                                        >
                                                                            <FileText className="w-4 h-4 mr-2" />
                                                                            View File
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                            <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                Internship Certificates
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    {profile.internship_certificates ? (
                                                                        <>
                                                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                                                                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                                            </div>
                                                                            <span className="text-sm text-green-600 dark:text-green-400">✓ Uploaded</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-sm text-gray-500 dark:text-gray-400">✗ Not uploaded</span>
                                                                    )}
                                                                </div>
                                                                {profile.internship_certificates && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => window.open(profile.internship_certificates, '_blank')}
                                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                                    >
                                                                        <FileText className="w-4 h-4 mr-2" />
                                                                        View File
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'social' && (
                                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
                                                            <Globe className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Social Profiles</h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">LinkedIn, GitHub, and personal websites</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditing('social')}
                                                        className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50/80 dark:text-cyan-400 dark:hover:bg-cyan-900/20 text-xs transition-all duration-200"
                                                    >
                                                        <ChevronRight className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </div>

                                                {editing === 'social' ? (
                                                    <ProfileSectionForm
                                                        section={{ id: 'social', title: 'Social Profiles', icon: Globe, fields: ['linkedin_profile', 'github_profile', 'personal_website'], completed: false }}
                                                        profile={profile}
                                                        onSave={(formData) => handleSave('social', formData)}
                                                        saving={saving}
                                                        onCancel={() => setEditing(null)}
                                                    />
                                                ) : (
                                                    <div className="space-y-4">
                                                        {profile.linkedin_profile && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    LinkedIn Profile
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <a
                                                                        href={profile.linkedin_profile}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline hover:no-underline transition-all duration-200"
                                                                    >
                                                                        {profile.linkedin_profile}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {profile.github_profile && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    GitHub Profile
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <a
                                                                        href={profile.github_profile}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline hover:no-underline transition-all duration-200"
                                                                    >
                                                                        {profile.github_profile}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {profile.personal_website && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    Personal Website
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <a
                                                                        href={profile.personal_website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline hover:no-underline transition-all duration-200"
                                                                    >
                                                                        {profile.personal_website}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!profile.linkedin_profile && !profile.github_profile && !profile.personal_website && (
                                                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                                                <div className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    Social Profiles
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    No social profiles provided yet
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
                    </div>
                </main>
            </div>

            {/* Image Modal for Profile Picture */}
            <ImageModal
                isOpen={imageModal.isOpen}
                onClose={() => setImageModal({ isOpen: false, imageUrl: '', altText: '' })}
                imageUrl={imageModal.imageUrl}
                altText={imageModal.altText}
            />
        </div>
    )
}

// Inline ProfileSectionForm Component
interface ProfileSectionFormProps {
    section: {
        id: string
        title: string
        icon: any
        fields: string[]
        completed: boolean
    }
    profile: StudentProfile
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
    
    // Use professional lookup hook for branches
    const { 
        data: branches, 
        loading: loadingBranches, 
        error: branchesError 
    } = useBranches({ 
        enabled: section.id === 'academic' 
    })

    // Use professional lookup hook for degrees
    const {
        data: degrees,
        loading: loadingDegrees,
        error: degreesError
    } = useDegrees({
        enabled: section.id === 'academic'
    })

    // Use professional lookup hook for universities
    const {
        data: universities,
        loading: loadingUniversities,
        error: universitiesError
    } = useUniversities({
        enabled: section.id === 'basic' || section.id === 'academic'
    })

    useEffect(() => {
        if (profile && section) {
            // Initialize form data with current profile values
            const initialData: any = {}
            section.fields.forEach(field => {
                initialData[field] = profile[field as keyof StudentProfile] || ''
            })
            setFormData(initialData)
        }
    }, [profile, section])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Clean up form data - convert empty strings to null for numeric fields
        const cleanedFormData = { ...formData }
        Object.keys(cleanedFormData).forEach(key => {
            if (cleanedFormData[key] === '') {
                cleanedFormData[key] = null
            }
        })

        // Remove error fields from the data being sent
        Object.keys(cleanedFormData).forEach(key => {
            if (key.endsWith('_error')) {
                delete cleanedFormData[key]
            }
        })

        // Check if there are any actual changes
        const hasChanges = Object.keys(cleanedFormData).some(key => {
            if (key === 'email') return false // Skip email field
            const currentValue = cleanedFormData[key]
            const originalValue = profile[key as keyof StudentProfile]
            return currentValue !== originalValue
        })

        if (!hasChanges) {
            onCancel() // Just close the form
            return
        }

        // Field-specific validation
        let hasValidationErrors = false
        const validationErrors: string[] = []

        // Basic Information Validation
        if (section.id === 'basic') {
            // Name validation
            if (!cleanedFormData.name || cleanedFormData.name.trim().length === 0) {
                validationErrors.push('Name is required')
                hasValidationErrors = true
            }

            // Phone validation
            if (cleanedFormData.phone && cleanedFormData.phone.length < 10) {
                validationErrors.push('Phone number must be 10 digits')
                hasValidationErrors = true
            }

            // Date of Birth validation
            if (cleanedFormData.dob) {
                const dobDate = new Date(cleanedFormData.dob)
                const today = new Date()
                const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
                const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate()) // Minimum 16 years old

                if (dobDate > today) {
                    validationErrors.push('Date of birth cannot be in the future')
                    hasValidationErrors = true
                } else if (dobDate < minDate) {
                    validationErrors.push('Please enter a valid date of birth')
                    hasValidationErrors = true
                } else if (dobDate > maxDate) {
                    validationErrors.push('You must be at least 16 years old')
                    hasValidationErrors = true
                }
            }
        }

        // Academic Information Validation
        if (section.id === 'academic') {
            // CGPA validation
            if (cleanedFormData.btech_cgpa !== null && cleanedFormData.btech_cgpa !== undefined) {
                const cgpa = parseFloat(cleanedFormData.btech_cgpa)
                if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
                    validationErrors.push('CGPA must be between 0 and 10')
                    hasValidationErrors = true
                }
            }

            // Percentage validation
            if (cleanedFormData.tenth_grade_percentage !== null && cleanedFormData.tenth_grade_percentage !== undefined) {
                const percentage = parseFloat(cleanedFormData.tenth_grade_percentage)
                if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                    validationErrors.push('10th percentage must be between 0 and 100')
                    hasValidationErrors = true
                }
            }

            if (cleanedFormData.twelfth_grade_percentage !== null && cleanedFormData.twelfth_grade_percentage !== undefined) {
                const percentage = parseFloat(cleanedFormData.twelfth_grade_percentage)
                if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                    validationErrors.push('12th percentage must be between 0 and 100')
                    hasValidationErrors = true
                }
            }

            // Graduation year validation
            if (cleanedFormData.graduation_year) {
                const currentYear = new Date().getFullYear()
                const gradYear = parseInt(cleanedFormData.graduation_year)
                if (isNaN(gradYear) || gradYear < currentYear - 10 || gradYear > currentYear + 10) {
                    validationErrors.push('Please enter a valid graduation year')
                    hasValidationErrors = true
                }
            }
        }

        // Skills Validation
        if (section.id === 'skills') {
            // Technical skills validation
            if (!cleanedFormData.technical_skills || cleanedFormData.technical_skills.trim().length === 0) {
                validationErrors.push('Technical skills are required')
                hasValidationErrors = true
            }

            // Preferred industry validation
            if (!cleanedFormData.preferred_industry || cleanedFormData.preferred_industry.trim().length === 0) {
                validationErrors.push('Preferred industry is required')
                hasValidationErrors = true
            }
        }

        // Experience Validation
        if (section.id === 'experience') {
            // At least one field should be filled
            const experienceFields = ['internship_experience', 'project_details', 'extracurricular_activities']
            const hasExperienceData = experienceFields.some(field =>
                cleanedFormData[field] && cleanedFormData[field].trim().length > 0
            )

            if (!hasExperienceData) {
                validationErrors.push('Please provide at least one experience, project, or extracurricular activity')
                hasValidationErrors = true
            }
        }

        // Social Profiles Validation
        if (section.id === 'social') {
            const socialFields = ['linkedin_profile', 'github_profile', 'personal_website']
            let socialErrors = false

            socialFields.forEach(field => {
                const url = cleanedFormData[field]
                if (url && url.trim().length > 0) {
                    try {
                        new URL(url)
                        setFormData((prev: any) => ({ ...prev, [`${field}_error`]: '' }))
                    } catch {
                        setFormData((prev: any) => ({ ...prev, [`${field}_error`]: 'Please enter a valid URL' }))
                        validationErrors.push(`Invalid URL format for ${field.replace('_', ' ')}`)
                        socialErrors = true
                    }
                }
            })

            if (socialErrors) {
                hasValidationErrors = true
            }

            // At least one social profile should be provided
            const hasSocialProfiles = socialFields.some(field =>
                cleanedFormData[field] && cleanedFormData[field].trim().length > 0
            )

            if (!hasSocialProfiles) {
                validationErrors.push('Please provide at least one social profile (LinkedIn, GitHub, or personal website)')
                hasValidationErrors = true
            }
        }

        // Documents Validation
        if (section.id === 'documents') {
            // Resume is required
            if (!cleanedFormData.resume) {
                validationErrors.push('Resume is required')
                hasValidationErrors = true
            }

            // Validate file URLs if provided
            const documentFields = ['resume', 'tenth_certificate', 'twelfth_certificate', 'internship_certificates']
            documentFields.forEach(field => {
                const url = cleanedFormData[field]
                if (url && !url.startsWith('http') && !url.startsWith('/')) {
                    validationErrors.push(`Invalid file URL for ${field.replace('_', ' ')}`)
                    hasValidationErrors = true
                }
            })
        }

        // If there are validation errors, show toast and return
        if (hasValidationErrors) {
            if (validationErrors.length > 0) {
                validationErrors.forEach(error => {
                    toast.error(error)
                })
            } else {
                toast.error('Please fix the validation errors before saving')
            }
            return
        }


        try {
            // Call onSave and handle the result
            onSave(cleanedFormData)

            // The onSave function should handle success/error toasts
            // We'll update the handleSave function to properly handle toasts
        } catch (error) {
            toast.error('Failed to save changes')
        }
    }

    const handleFileUpload = async (field: string, file: File) => {
        setUploading(field)
        setUploadError(null)

        try {
            // Get auth token from useAuth hook
            const token = getToken()
            if (!token) {
                throw new Error('Authentication token not found')
            }

            console.log('Starting file upload for field:', field)
            console.log('File details:', { name: file.name, size: file.size, type: file.type })

            // Import the FileUploadService dynamically to avoid circular dependencies
            const { FileUploadService } = await import('@/services/fileUploadService')

            let response
            switch (field) {
                case 'profile_picture':
                    response = await FileUploadService.uploadProfilePicture(file, token)
                    break
                case 'resume':
                    response = await FileUploadService.uploadResume(file, token)
                    break
                case 'tenth_certificate':
                    response = await FileUploadService.uploadTenthCertificate(file, token)
                    break
                case 'twelfth_certificate':
                    response = await FileUploadService.uploadTwelfthCertificate(file, token)
                    break
                case 'internship_certificates':
                    response = await FileUploadService.uploadInternshipCertificates(file, token)
                    break
                default:
                    throw new Error('Unknown field type')
            }

            // Update form data with the uploaded file URL
            const fileUrl = response.certificate_url || response.resume_url || response.profile_picture_url || ''
            setFormData({ ...formData, [field]: fileUrl })
            setUploadSuccess(field)
            setUploadError(null)

            // Clear success message after 3 seconds
            setTimeout(() => setUploadSuccess(null), 3000)

            // Persist immediately so top badges (photo/resume) update without extra save
            try {
                await onSave({ [field]: fileUrl } as any)
            } catch (e) {
                // non-blocking
            }

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

        if (field === 'email') {
            return (
                <input
                    type="email"
                    value={value}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    placeholder="Email address"
                />
            )
        }
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
                </div>
            )
        }

        if (field === 'resume') {
            return (
                <div className="space-y-3">
                    <FileUpload
                        type="document"
                        onFileSelect={(file) => handleFileUpload(field, file)}
                        onFileRemove={() => handleFileRemove(field)}
                        currentFile={value}
                        placeholder="Upload your resume (PDF only)"
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

        if (field === '10th_certificate' || field === '12th_certificate' || field === 'internship_certificates') {
            // Map display field names to backend field names
            const backendFieldName = field === '10th_certificate' ? 'tenth_certificate' : 
                                   field === '12th_certificate' ? 'twelfth_certificate' : 
                                   field
            const displayName = field === '10th_certificate' ? '10th certificate' :
                               field === '12th_certificate' ? '12th certificate' :
                               field.replace(/_/g, ' ')
            
            return (
                <div className="space-y-3">
                    <FileUpload
                        type="document"
                        onFileSelect={(file) => handleFileUpload(backendFieldName, file)}
                        onFileRemove={() => handleFileRemove(backendFieldName)}
                        currentFile={formData[backendFieldName] || ''}
                        placeholder={`Upload your ${displayName} (PDF only)`}
                        disabled={uploading === backendFieldName}
                    />
                    {uploading === backendFieldName && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                        </div>
                    )}
                </div>
            )
        }

        // Handle phone field: enforce digits-only input
        if (field === 'phone') {
            return (
                <input
                    type="tel"
                    value={value}
                    onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '')
                        const limited = digitsOnly.slice(0, 10)
                        setFormData({ ...formData, [field]: limited })
                    }}
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your phone number"
                />
            )
        }

        if (field.includes('bio') || field.includes('experience') || field.includes('details') || field.includes('activities')) {
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

        // Handle date of birth field
        if (field === 'dob') {
            return (
                <input
                    type="date"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Select your date of birth"
                />
            )
        }

        // Handle gender field
        if (field === 'gender') {
            return (
                <select
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            )
        }

        // Handle location preferences field (textarea for multiple locations)
        if (field === 'location_preferences') {
            return (
                <textarea
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your preferred locations (e.g., Mumbai, Delhi, Remote, Bangalore)"
                />
            )
        }

        if (field.includes('year')) {
            return (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value === '' ? null : e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter your ${field.replace(/_/g, ' ')} (e.g., 2021-2022)`}
                />
            )
        }

        if (field.includes('cgpa')) {
            return (
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value === '' ? null : e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                />
            )
        }

        if (field.includes('percentage')) {
            return (
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value === '' ? null : e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                />
            )
        }

        // Handle social profile fields with URL validation
        if (field === 'linkedin_profile' || field === 'github_profile' || field === 'personal_website') {
            const isValidUrl = (url: string) => {
                if (!url) return true // Allow empty URLs
                try {
                    new URL(url)
                    return true
                } catch {
                    return false
                }
            }

            const fieldError = formData[`${field}_error`] || ''

            return (
                <div className="space-y-2">
                    <input
                        type="url"
                        value={value}
                        onChange={(e) => {
                            const url = e.target.value
                            const isValid = isValidUrl(url)
                            setFormData({
                                ...formData,
                                [field]: url,
                                [`${field}_error`]: isValid ? '' : 'Please enter a valid URL'
                            })
                        }}
                        onBlur={(e) => {
                            const url = e.target.value
                            if (url && !isValidUrl(url)) {
                                setFormData({
                                    ...formData,
                                    [`${field}_error`]: 'Please enter a valid URL'
                                })
                            }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${fieldError
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                            }`}
                        placeholder={`Enter your ${field.replace(/_/g, ' ')} URL`}
                    />
                    {fieldError && (
                        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>{fieldError}</span>
                        </div>
                    )}
                </div>
            )
        }

        // Handle branch field with professional lookup component
        if (field === 'branch') {
            return (
                <LookupSelect
                    value={value}
                    onChange={(newValue) => setFormData({ ...formData, [field]: newValue })}
                    data={branches}
                    loading={loadingBranches}
                    placeholder="Select your branch"
                    error={branchesError || undefined}
                    required
                />
            )
        }

        // Handle degree field with professional lookup component
        if (field === 'degree') {
            return (
                <LookupSelect
                    value={value}
                    onChange={(newValue) => setFormData({ ...formData, [field]: newValue })}
                    data={degrees}
                    loading={loadingDegrees}
                    placeholder="Select your degree"
                    error={degreesError || undefined}
                    required
                />
            )
        }

        // Handle institution field with professional lookup component
        if (field === 'institution') {
            return (
                <LookupSelect
                    value={value}
                    onChange={(newValue) => setFormData({ ...formData, [field]: newValue })}
                    data={universities}
                    loading={loadingUniversities}
                    placeholder="Select your institution"
                    error={universitiesError || undefined}
                    required
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

            {section.id === 'academic' ? (
                // Academic Section - Organized Layout
                <>
                    {/* Academic Information Notice */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                    Flexible Academic Information
                                </h4>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    You can fill any combination of College, Class XII, and Class X information.
                                    Fill in the sections that apply to your educational background.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* College Section */}
                    <div className="border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 bg-gradient-to-r from-emerald-50/30 to-teal-50/30 dark:from-emerald-900/20 dark:to-teal-900/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">College</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {section.fields.filter(field =>
                                ['institution', 'degree', 'branch', 'graduation_year', 'btech_cgpa'].includes(field)
                            ).map((field) => (
                                <div key={field} className={field.includes('bio') || field.includes('experience') || field.includes('details') || field.includes('activities') ? 'md:col-span-2' : ''}>
                                    <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 capitalize">
                                        {field.replace(/_/g, ' ')}
                                    </label>
                                    {renderField(field)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 12th Section */}
                    <div className="border border-blue-200 dark:border-blue-700 rounded-xl p-6 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Class XII</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                                    Twelfth Grade Percentage
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.twelfth_grade_percentage || ''}
                                    onChange={(e) => setFormData({ ...formData, twelfth_grade_percentage: e.target.value === '' ? null : e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter your 12th grade percentage"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 10th Section */}
                    <div className="border border-purple-200 dark:border-purple-700 rounded-xl p-6 bg-gradient-to-r from-purple-50/30 to-pink-50/30 dark:from-purple-900/20 dark:to-pink-900/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Class X</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                                    Tenth Grade Percentage
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.tenth_grade_percentage || ''}
                                    onChange={(e) => setFormData({ ...formData, tenth_grade_percentage: e.target.value === '' ? null : e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter your 10th grade percentage"
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                // All Other Sections - Simple Grid Layout
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.fields.map((field) => {
                        // Map display field names to proper labels
                        const getFieldLabel = (fieldName: string) => {
                            if (fieldName === '10th_certificate') return '10th Certificate'
                            if (fieldName === '12th_certificate') return '12th Certificate'
                            return fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        }
                        
                        return (
                            <div key={field} className={field.includes('bio') || field.includes('experience') || field.includes('details') || field.includes('activities') ? 'md:col-span-2' : ''}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {getFieldLabel(field)}
                                </label>
                                {renderField(field)}
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="px-6 py-2"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    )
}

// Add missing closing tags for the main content structure
// This should be added at the very end of the main return statement
// around line 1550-1573 where the main content ends
