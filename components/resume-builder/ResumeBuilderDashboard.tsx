"use client"

import { motion } from 'framer-motion'
import { Plus, FileText, Download, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { resumeService, type ResumeData } from '@/services/resumeService'
import toast from 'react-hot-toast'
import { ResumePreview } from './ResumePreview'

// Defer importing html2pdf to client runtime to avoid SSR issues
let html2pdf: any
if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    html2pdf = require('html2pdf.js')
}

interface ResumeBuilderDashboardProps {
    onNewResume: () => void
    onEditResume: (resumeId: string) => void
}

interface ResumePreview {
    name: string
    title: string
    email: string
    phone: string
    summary: string
    skills: string[]
    experience: string
}

export function ResumeBuilderDashboard({ onNewResume, onEditResume }: ResumeBuilderDashboardProps) {
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const [resumes, setResumes] = useState<ResumeData[]>([])
    const [loading, setLoading] = useState(true)
    const [downloadingResume, setDownloadingResume] = useState<ResumeData | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const downloadPreviewRef = useRef<HTMLDivElement | null>(null)

    // Load resumes on component mount
    useEffect(() => {
        loadResumes()
    }, [])

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const loadResumes = async () => {
        try {
            setLoading(true)
            const response = await resumeService.getResumes()
            setResumes(response.resumes)
        } catch (error) {
            console.error('Error loading resumes:', error)
            toast.error('Failed to load resumes')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteResume = async (resumeId: string) => {
        try {
            await resumeService.deleteResume(resumeId)
            toast.success('Resume deleted successfully')
            loadResumes() // Reload the list
        } catch (error) {
            console.error('Error deleting resume:', error)
            toast.error('Failed to delete resume')
        }
    }

    // Helper function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        })
    }

    // Helper function to get resume preview data
    const getResumePreview = (resume: ResumeData): ResumePreview => {
        const content = resume.content
        return {
            name: content.header.fullName || 'Unnamed',
            title: content.experience?.[0]?.position || 'Professional',
            email: content.header.email || '',
            phone: content.header.phone || '',
            summary: content.summary || '',
            skills: [
                ...(content.skills.technical || []),
                ...(content.skills.soft || [])
            ].slice(0, 4),
            experience: content.experience?.[0]?.company || 'No experience listed'
        }
    }

    const handleMenuToggle = (resumeId: string) => {
        setOpenMenu(openMenu === resumeId ? null : resumeId)
    }

    const handleAction = (action: string, resumeId: string) => {
        setOpenMenu(null)
        switch (action) {
            case 'edit':
                onEditResume(resumeId)
                break
            case 'download': {
                const resume = resumes.find(r => r.id === resumeId)
                if (!resume) {
                    toast.error('Resume not found for download')
                    return
                }
                setDownloadingResume(resume)
                break
            }
            case 'delete':
                handleDeleteResume(resumeId)
                break
        }
    }

    // Called by the hidden ResumePreview once the template has fully loaded,
    // so the generated PDF captures the actual resume rather than the loading state.
    const handlePreviewReady = async () => {
        if (!downloadingResume || !downloadPreviewRef.current || !html2pdf || isDownloading) {
            return
        }

        try {
            setIsDownloading(true)

            const safeName =
                downloadingResume.content?.header?.fullName ||
                downloadingResume.name ||
                'resume'

            const fileName = `${safeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf`

            const options = {
                margin: [10, 10, 10, 10] as [number, number, number, number],
                filename: fileName,
                image: { type: 'jpeg', quality: 0.85 },
                html2canvas: {
                    scale: 1.5,
                    useCORS: true,
                    allowTaint: true,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true,
                },
            }

            await html2pdf().from(downloadPreviewRef.current).set(options).save()
            toast.success('Resume downloaded successfully!')
        } catch (error) {
            console.error('Error downloading resume:', error)
            toast.error('Failed to download resume. Please try again.')
        } finally {
            setIsDownloading(false)
            setDownloadingResume(null)
        }
    }

    const getStatusBadgeClass = (status: 'draft' | 'published' | 'archived') => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            case 'archived':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-400'
        }
    }

    return (
        <div className="space-y-6">

            {/* Your Resumes Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
            >
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Your Resumes
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Manage and edit your existing resumes
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* New Resume Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border-2 border-dashed border-primary-300 dark:border-primary-500 rounded-lg p-6 hover:border-primary-400 dark:hover:border-primary-400 transition-all duration-300 cursor-pointer bg-primary-50/50 dark:bg-primary-900/20 hover:bg-primary-100/70 dark:hover:bg-primary-800/30 hover:shadow-md"
                        onClick={onNewResume}
                    >
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-800/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Plus className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-2">
                                New Resume
                            </h3>
                            <p className="text-sm text-primary-600 dark:text-primary-300">
                                Create a new resume from scratch or pre-fill with your profile
                            </p>
                        </div>
                    </motion.div>

                    {/* Existing Resume Cards */}
                    {loading ? (
                        <div className="col-span-full flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading resumes...</span>
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-600">No resumes found. Create your first resume to get started!</p>
                        </div>
                    ) : (
                        resumes.map((resume, index) => {
                            // Define color schemes for each resume card (similar to dashboard stats)
                            const colorSchemes = [
                                {
                                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                                    border: 'border-blue-200 dark:border-blue-700',
                                    headerBg: 'bg-blue-100/50 dark:bg-blue-800/30',
                                    iconBg: 'bg-blue-500',
                                    iconColor: 'text-white'
                                },
                                {
                                    bg: 'bg-green-50 dark:bg-green-900/20',
                                    border: 'border-green-200 dark:border-green-700',
                                    headerBg: 'bg-green-100/50 dark:bg-green-800/30',
                                    iconBg: 'bg-green-500',
                                    iconColor: 'text-white'
                                },
                                {
                                    bg: 'bg-purple-50 dark:bg-purple-900/20',
                                    border: 'border-purple-200 dark:border-purple-700',
                                    headerBg: 'bg-purple-100/50 dark:bg-purple-800/30',
                                    iconBg: 'bg-purple-500',
                                    iconColor: 'text-white'
                                },
                                {
                                    bg: 'bg-orange-50 dark:bg-orange-900/20',
                                    border: 'border-orange-200 dark:border-orange-700',
                                    headerBg: 'bg-orange-100/50 dark:bg-orange-800/30',
                                    iconBg: 'bg-orange-500',
                                    iconColor: 'text-white'
                                },
                                {
                                    bg: 'bg-teal-50 dark:bg-teal-900/20',
                                    border: 'border-teal-200 dark:border-teal-700',
                                    headerBg: 'bg-teal-100/50 dark:bg-teal-800/30',
                                    iconBg: 'bg-teal-500',
                                    iconColor: 'text-white'
                                }
                            ];

                            const colorScheme = colorSchemes[index % colorSchemes.length];

                            return (
                                <motion.div
                                    key={resume.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                    className={`${colorScheme.bg} rounded-lg ${colorScheme.border} shadow-sm hover:shadow-md transition-shadow border-2`}
                                >
                                    {/* Header with colored background */}
                                    <div className={`p-4 ${colorScheme.headerBg} border-b ${colorScheme.border}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                    {resume.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Last updated: {formatDate(resume.updated_at)}
                                                </p>
                                            </div>
                                            <div className="relative ml-2" ref={menuRef}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-700/50"
                                                    onClick={() => handleMenuToggle(resume.id)}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>

                                                {/* Dropdown Menu */}
                                                {openMenu === resume.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => handleAction('edit', resume.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction('download', resume.id)}
                                                                disabled={isDownloading}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-60"
                                                            >
                                                                <Download className="w-4 h-4 mr-2" />
                                                                {isDownloading ? 'Downloading...' : 'Download'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction('delete', resume.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resume Preview Content */}
                                    <div className="p-4">
                                        <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50 min-h-[330px]">
                                            {/* Mini Resume Preview */}
                                            <div className="space-y-3 text-xs">
                                                {(() => {
                                                    const preview = getResumePreview(resume)
                                                    return (
                                                        <>
                                                            {/* Header */}
                                                            <div className="text-center border-b border-gray-300 pb-3 mb-3">
                                                                <div className="font-bold text-gray-900 dark:text-white text-sm">
                                                                    {preview.name}
                                                                </div>
                                                                <div className="text-gray-600 dark:text-gray-400">
                                                                    {preview.title}
                                                                </div>
                                                                <div className="text-gray-500 dark:text-gray-500 text-xs">
                                                                    {preview.email} • {preview.phone}
                                                                </div>
                                                            </div>

                                                            {/* Summary */}
                                                            <div className="text-gray-700 dark:text-gray-300 line-clamp-3 leading-tight">
                                                                {preview.summary}
                                                            </div>

                                                            {/* Skills Preview */}
                                                            <div className="flex flex-wrap gap-1 mt-3">
                                                                {preview.skills.slice(0, 4).map((skill: string, idx: number) => (
                                                                    <span key={idx} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                                {preview.skills.length > 4 && (
                                                                    <span key="more" className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
                                                                        +{preview.skills.length - 4}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Experience */}
                                                            <div className="text-gray-600 dark:text-gray-400 text-xs mt-3">
                                                                {preview.experience}
                                                            </div>
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer with Status and Template */}
                                    <div className="px-4 pb-4 flex items-center justify-between">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(resume.status)}`}>
                                            {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {resume.template?.name || 'Default Template'}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </motion.div>

            {/* Resume Building Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-6"
            >
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">💡</span>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        Resume Building Tips
                    </h3>
                </div>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                    <li>• Keep your resume concise and focused on relevant experience</li>
                    <li>• Use action verbs to describe your achievements</li>
                    <li>• Tailor your resume for each job application</li>
                    <li>• Include quantifiable results when possible</li>
                    <li>• Proofread carefully for grammar and spelling errors</li>
                </ul>
            </motion.div>

            {/* Hidden preview container used for generating PDFs when downloading from the dashboard */}
            <div
                style={{
                    position: 'fixed',
                    left: '-10000px',
                    top: 0,
                    width: '800px',
                    pointerEvents: 'none',
                    opacity: 0,
                    zIndex: -1,
                }}
            >
                {downloadingResume && (
                    <div ref={downloadPreviewRef}>
                        <ResumePreview
                            resumeData={downloadingResume.content}
                            templateId={downloadingResume.template_id}
                            onReady={handlePreviewReady}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
