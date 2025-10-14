"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Save, Download, UserPlus, FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResumeForm } from './ResumeForm'
import { ResumePreview } from './ResumePreview'
import { useProfile } from '@/hooks/useProfile'
import { resumeService, type ResumeContent } from '@/services/resumeService'
// Defer importing html2pdf to client runtime to avoid SSR ReferenceError: self is not defined
let html2pdf: any
if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    html2pdf = require('html2pdf.js')
}
import toast from 'react-hot-toast'

interface ResumeBuilderProps {
    templateId: string | null
    resumeId: string | null
}

interface ResumeData {
    header: {
        fullName: string
        email: string
        phone: string
        location: string
        linkedin: string
        website: string
        profilePhoto?: string
    }
    summary: string
    experience: Array<{
        id: string
        company: string
        position: string
        location: string
        startDate: string
        endDate: string
        current: boolean
        description: string[]
    }>
    education: Array<{
        id: string
        institution: string
        degree: string
        field: string
        location: string
        startDate: string
        endDate: string
        current: boolean
        gpa: string
        achievements: string[]
    }>
    skills: {
        technical: string[]
        soft: string[]
        languages: string[]
    }
    projects: Array<{
        id: string
        name: string
        description: string
        technologies: string[]
        link: string
        github: string
    }>
    certifications: Array<{
        id: string
        name: string
        issuer: string
        date: string
        link: string
    }>
}

const createDefaultResumeData = (profile: any): ResumeData => ({
    header: {
        fullName: profile?.name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        location: profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : '',
        linkedin: profile?.linkedin_profile || '',
        website: profile?.personal_website || '',
        profilePhoto: profile?.profile_picture || ''
    },
    summary: profile?.bio || '',
    experience: profile?.internship_experience ? [{
        id: Date.now().toString(),
        company: profile.internship_experience.includes(' at ') ?
            profile.internship_experience.split(' at ')[1]?.split(' (')[0] || 'Company' : 'Company',
        position: profile.internship_experience.includes(' at ') ?
            profile.internship_experience.split(' at ')[0] || 'Intern' : 'Intern',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: [profile.internship_experience]
    }] : [],
    education: [{
        id: Date.now().toString(),
        institution: profile?.institution || '',
        degree: profile?.degree || '',
        field: profile?.branch || '',
        location: profile?.city || '',
        startDate: '',
        endDate: profile?.graduation_year ? profile.graduation_year.toString() : '',
        current: !profile?.graduation_year,
        gpa: profile?.btech_cgpa ? profile.btech_cgpa.toString() : '',
        achievements: []
    }],
    skills: {
        technical: profile?.technical_skills ? profile.technical_skills.split(',').map((s: string) => s.trim()) : [],
        soft: profile?.soft_skills ? profile.soft_skills.split(',').map((s: string) => s.trim()) : [],
        languages: []
    },
    projects: profile?.project_details ? [{
        id: Date.now().toString(),
        name: 'Project Details',
        description: profile.project_details,
        technologies: [],
        link: profile?.github_profile || '',
        github: profile?.github_profile || ''
    }] : [],
    certifications: profile?.certifications ? [{
        id: Date.now().toString(),
        name: 'Certifications',
        issuer: '',
        date: '',
        link: ''
    }] : []
})

export function ResumeBuilder({ templateId, resumeId }: ResumeBuilderProps) {
    const { profile, loading: profileLoading, error: profileError, isAuthenticated, refreshProfile } = useProfile()
    const [resumeData, setResumeData] = useState<ResumeData | null>(null)
    const [showPreview, setShowPreview] = useState(true)
    const [showForm, setShowForm] = useState(true)
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const previewRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (profile) {
            // Initialize resume data with profile information
            const defaultData = createDefaultResumeData(profile)
            setResumeData(defaultData)
        }
    }, [profile])

    useEffect(() => {
        if (resumeId) {
            // TODO: Load existing resume data
            loadResumeData(resumeId)
        } else if (templateId && profile) {
            // TODO: Load template structure and initialize form
            loadTemplateStructure(templateId)
        }
    }, [resumeId, templateId, profile])

    const loadResumeData = async (resumeId: string) => {
        try {
            const resume = await resumeService.getResumeById(resumeId)
            setResumeData(resume.content)
        } catch (error) {
            console.error('Error loading resume:', error)
            toast.error('Failed to load resume data')
        }
    }

    const loadTemplateStructure = async (templateId: string) => {
        // TODO: Implement API call to load template structure
        console.log('Loading template:', templateId)
    }

    const handleSave = async () => {
        if (!resumeData) {
            toast.error('No resume data to save')
            return
        }

        setLoading(true)
        try {
            const resumeName = resumeData.header.fullName ? `${resumeData.header.fullName}'s Resume` : 'My Resume'

            if (resumeId) {
                // Update existing resume
                await resumeService.updateResume(resumeId, {
                    name: resumeName,
                    content: resumeData as ResumeContent,
                    status: 'published'
                })
                toast.success('Resume updated successfully!')
            } else {
                // Create new resume
                // Get the first available template
                const templates = await resumeService.getTemplates()
                const defaultTemplateId = templates.templates[0]?.id || '550e8400-e29b-41d4-a716-446655440000'

                await resumeService.createResume({
                    template_id: templateId || defaultTemplateId,
                    name: resumeName,
                    content: resumeData as ResumeContent,
                    status: 'published'
                })
                toast.success('Resume saved successfully!')
            }

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (error) {
            console.error('Error saving resume:', error)
            toast.error('Failed to save resume. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!previewRef.current) {
            console.error('Preview element not found')
            return
        }

        try {
            setLoading(true)

            // Configure PDF options with optimized settings for smaller file size
            const options = {
                margin: [10, 10, 10, 10] as [number, number, number, number],
                filename: `${resumeData?.header?.fullName || 'resume'}_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.85 }, // Reduced from 0.98 to 0.85 for smaller file size
                enableLinks: true,
                html2canvas: {
                    scale: 1.5, // Reduced from 2 to 1.5 for smaller file size while maintaining quality
                    useCORS: true,
                    allowTaint: true
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true // Enable PDF compression
                }
            }

            // Generate and download PDF
            if (!html2pdf) {
                throw new Error('PDF generator not available in this environment')
            }
            await html2pdf()
                .from(previewRef.current)
                .set(options)
                .save()

        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleAddToProfile = async () => {
        // TODO: Implement add to profile functionality
        console.log('Adding resume to profile...')
    }

    const updateResumeData = (section: string, data: any) => {
        setResumeData(prev => prev ? ({
            ...prev,
            [section as keyof ResumeData]: data
        }) : null)
    }

    const addExperience = () => {
        if (!resumeData) return
        const newExperience = {
            id: Date.now().toString(),
            company: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ['']
        }
        setResumeData(prev => prev ? ({
            ...prev,
            experience: [...prev.experience, newExperience]
        }) : null)
    }

    const removeExperience = (index: number) => {
        if (!resumeData) return
        const newExperience = [...resumeData.experience]
        newExperience.splice(index, 1)
        setResumeData(prev => prev ? ({
            ...prev,
            experience: newExperience
        }) : null)
    }

    const updateExperience = (index: number, field: string, value: any) => {
        if (!resumeData) return
        const newExperience = [...resumeData.experience]
        newExperience[index] = { ...newExperience[index], [field]: value }
        setResumeData(prev => prev ? ({
            ...prev,
            experience: newExperience
        }) : null)
    }

    const addEducation = () => {
        if (!resumeData) return
        const newEducation = {
            id: Date.now().toString(),
            institution: '',
            degree: '',
            field: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            gpa: '',
            achievements: ['']
        }
        setResumeData(prev => prev ? ({
            ...prev,
            education: [...prev.education, newEducation]
        }) : null)
    }

    const removeEducation = (index: number) => {
        if (!resumeData) return
        const newEducation = [...resumeData.education]
        newEducation.splice(index, 1)
        setResumeData(prev => prev ? ({
            ...prev,
            education: newEducation
        }) : null)
    }

    const updateEducation = (index: number, field: string, value: any) => {
        if (!resumeData) return
        const newEducation = [...resumeData.education]
        newEducation[index] = { ...newEducation[index], [field]: value }
        setResumeData(prev => prev ? ({
            ...prev,
            education: newEducation
        }) : null)
    }

    const addProject = () => {
        if (!resumeData) return
        const newProject = {
            id: Date.now().toString(),
            name: '',
            description: '',
            technologies: [],
            link: '',
            github: ''
        }
        setResumeData(prev => prev ? ({
            ...prev,
            projects: [...prev.projects, newProject]
        }) : null)
    }

    const removeProject = (index: number) => {
        if (!resumeData) return
        const newProjects = [...resumeData.projects]
        newProjects.splice(index, 1)
        setResumeData(prev => prev ? ({
            ...prev,
            projects: newProjects
        }) : null)
    }

    const updateProject = (index: number, field: string, value: any) => {
        if (!resumeData) return
        const newProjects = [...resumeData.projects]
        newProjects[index] = { ...newProjects[index], [field]: value }
        setResumeData(prev => prev ? ({
            ...prev,
            projects: newProjects
        }) : null)
    }

    const addCertification = () => {
        if (!resumeData) return
        const newCertification = {
            id: Date.now().toString(),
            name: '',
            issuer: '',
            date: '',
            link: ''
        }
        setResumeData(prev => prev ? ({
            ...prev,
            certifications: [...prev.certifications, newCertification]
        }) : null)
    }

    const removeCertification = (index: number) => {
        if (!resumeData) return
        const newCertifications = [...resumeData.certifications]
        newCertifications.splice(index, 1)
        setResumeData(prev => prev ? ({
            ...prev,
            certifications: newCertifications
        }) : null)
    }

    const updateCertification = (index: number, field: string, value: any) => {
        if (!resumeData) return
        const newCertifications = [...resumeData.certifications]
        newCertifications[index] = { ...newCertifications[index], [field]: value }
        setResumeData(prev => prev ? ({
            ...prev,
            certifications: newCertifications
        }) : null)
    }

    const addSkill = (type: 'technical' | 'soft' | 'languages') => {
        if (!resumeData) return
        const newSkills = [...resumeData.skills[type], '']
        setResumeData(prev => prev ? ({
            ...prev,
            skills: {
                ...prev.skills,
                [type]: newSkills
            }
        }) : null)
    }

    const removeSkill = (type: 'technical' | 'soft' | 'languages', index: number) => {
        if (!resumeData) return
        const newSkills = [...resumeData.skills[type]]
        newSkills.splice(index, 1)
        setResumeData(prev => prev ? ({
            ...prev,
            skills: {
                ...prev.skills,
                [type]: newSkills
            }
        }) : null)
    }

    const updateSkill = (type: 'technical' | 'soft' | 'languages', index: number, value: string) => {
        if (!resumeData) return
        const newSkills = [...resumeData.skills[type]]
        newSkills[index] = value
        setResumeData(prev => prev ? ({
            ...prev,
            skills: {
                ...prev.skills,
                [type]: newSkills
            }
        }) : null)
    }

    // Show authentication message if user is not logged in
    if (!isAuthenticated && !profileLoading) {
        return (
            <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Authentication Required
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Please log in to access your profile data and create personalized resumes.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.href = '/auth/login'}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => window.location.href = '/auth/register'}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>Currently showing demo data. Log in to see your real profile information.</p>
                    </div>
                </div>
            </div>
        )
    }

    // Show loading state
    if (profileLoading) {
        return (
            <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
                </div>
            </div>
        )
    }

    // Show error state
    if (profileError && !profile) {
        return (
            <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Profile Loading Error
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {profileError}
                    </p>
                    <button
                        onClick={refreshProfile}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Profile not found. Please check your profile settings.</p>
                </div>
            </div>
        )
    }

    if (!resumeData) {
        return (
            <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Initializing resume...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="w-full px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {resumeId ? 'Edit Resume' : 'Create New Resume'}
                            </h1>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-3">
                            {/* Mobile Toggle Buttons - Only visible on small screens */}
                            <div className="flex lg:hidden space-x-2 w-full sm:w-auto justify-center sm:justify-start">
                                <Button
                                    variant={showForm ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setShowForm(true)
                                        setShowPreview(false)
                                    }}
                                    className="flex items-center space-x-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span className="hidden sm:inline">Form</span>
                                </Button>
                                <Button
                                    variant={showPreview ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setShowForm(false)
                                        setShowPreview(true)
                                    }}
                                    className="flex items-center space-x-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className="hidden sm:inline">Preview</span>
                                </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:space-x-3 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={handleAddToProfile}
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-full sm:w-auto"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add to Profile
                                </Button>

                                <Button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 w-full sm:w-auto"
                                >
                                    {loading ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                                </Button>

                                <Button
                                    onClick={handleDownload}
                                    disabled={loading}
                                    variant="outline"
                                    className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 w-full sm:w-auto"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {loading ? 'Generating...' : 'Download PDF'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-3 sm:px-4 py-4 sm:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {/* Form Section - Hidden on mobile when preview is active */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`space-y-6 ${!showForm && !showPreview ? 'block' : showForm ? 'block' : 'hidden lg:block'}`}
                    >
                        <ResumeForm
                            resumeData={resumeData}
                            onUpdate={updateResumeData}
                            onAddExperience={addExperience}
                            onAddEducation={addEducation}
                            onAddProject={addProject}
                            onAddCertification={addCertification}
                        />
                    </motion.div>

                    {/* Preview Section - Hidden on mobile when form is active */}
                    <motion.div
                        ref={previewRef}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`sticky top-24 min-h-[calc(100vh-12rem)] ${!showForm && !showPreview ? 'block' : showPreview ? 'block' : 'hidden lg:block'}`}
                    >
                        <ResumePreview
                            resumeData={resumeData}
                            templateId={templateId}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
