"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResumeBuilderDashboard } from './ResumeBuilderDashboard'
import { TemplateSelection } from './TemplateSelection'
import { ResumeBuilder } from './ResumeBuilder'
import { useProfile } from '@/hooks/useProfile'

type ResumeBuilderView = 'dashboard' | 'templates' | 'builder'

export function ResumeBuilderPage() {
    const { profile, loading, error } = useProfile()
    const [currentView, setCurrentView] = useState<ResumeBuilderView>('dashboard')
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [selectedResume, setSelectedResume] = useState<string | null>(null)

    // Debug logging
    useEffect(() => {
        console.log('ResumeBuilderPage - Profile loading:', loading)
        console.log('ResumeBuilderPage - Profile data:', profile)
        console.log('ResumeBuilderPage - Profile error:', error)
    }, [profile, loading, error])

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId)
        setCurrentView('builder')
    }

    const handleResumeSelect = (resumeId: string) => {
        setSelectedResume(resumeId)
        setCurrentView('builder')
    }

    const handleBackToDashboard = () => {
        setCurrentView('dashboard')
        setSelectedTemplate(null)
        setSelectedResume(null)
    }

    const handleBackToTemplates = () => {
        setCurrentView('templates')
        setSelectedTemplate(null)
    }

    // Show loading state while profile is loading
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            </div>
        )
    }

    // Show error state if profile loading failed
    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                        Error Loading Profile
                    </h3>
                    <p className="text-red-600 dark:text-red-300">{error}</p>
                </div>
            </div>
        )
    }

    // Show content once profile is loaded
    if (!profile) {
        return (
            <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        No Profile Data
                    </h3>
                    <p className="text-yellow-600 dark:text-yellow-300">
                        Unable to load profile data. Please try again.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header - small: stacked, tighter padding; sm+ unchanged */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary-200 dark:border-primary-700 mb-4 sm:mb-6 min-w-0 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-6">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                            Resume Builder 📄
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-2 sm:mb-3">
                            Create professional resumes with our AI-powered builder ✨
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                📈 Career Growth
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                🚀 New Opportunities
                            </span>
                        </div>
                    </div>
                    {/* Buttons: small = full-width stack; sm+ = row, no change */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 sm:space-x-3 shrink-0 w-full sm:w-auto min-w-0">
                        {currentView !== 'dashboard' && (
                            <Button
                                variant="outline"
                                onClick={handleBackToDashboard}
                                className="flex items-center justify-center sm:justify-start space-x-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white w-full sm:w-auto min-h-10 text-sm"
                            >
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                <span>Dashboard</span>
                            </Button>
                        )}
                        {currentView === 'builder' && (
                            <Button
                                variant="outline"
                                onClick={handleBackToTemplates}
                                className="flex items-center justify-center sm:justify-start space-x-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white w-full sm:w-auto min-h-10 text-sm"
                            >
                                <Filter className="w-4 h-4 flex-shrink-0" />
                                <span>Change Template</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {currentView === 'dashboard' && (
                    <ResumeBuilderDashboard
                        onNewResume={() => setCurrentView('templates')}
                        onEditResume={handleResumeSelect}
                    />
                )}

                {currentView === 'templates' && (
                    <TemplateSelection
                        onTemplateSelect={handleTemplateSelect}
                    />
                )}

                {currentView === 'builder' && (
                    <ResumeBuilder
                        templateId={selectedTemplate}
                        resumeId={selectedResume}
                    />
                )}
            </motion.div>
        </div>
    )
}
