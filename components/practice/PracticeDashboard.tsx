"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain, Clock, Users, Trophy, ArrowLeft, CalendarDays } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PracticeCard } from './PracticeCard'
import { PracticeExam } from './PracticeExam'
import { ResultReport } from './ResultReport'
import { PracticeFilter, PracticeCategory } from './PracticeFilter'
import { usePracticeModules } from '@/hooks/usePractice'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton, CardSkeleton, StatsSkeleton } from '@/components/ui/LoadingSkeleton'

type ViewState = 'dashboard' | 'exam' | 'result'

export function PracticeDashboard() {
    const router = useRouter()
    const [currentView, setCurrentView] = useState<ViewState>('dashboard')
    const [selectedModule, setSelectedModule] = useState<PracticeModule | null>(null)
    const [examResult, setExamResult] = useState<SubmitAttemptResponse | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<PracticeCategory>('all')
    const [selectedUniversities, setSelectedUniversities] = useState<string[]>([])
    const [selectedBranches, setSelectedBranches] = useState<string[]>([])
    const [submittedModules, setSubmittedModules] = useState<Set<string>>(new Set())
    const [moduleResults, setModuleResults] = useState<Map<string, SubmitAttemptResponse>>(new Map())
    const [isClient, setIsClient] = useState(false)

    const { data: allModules, isLoading, error } = usePracticeModules()
    const { profile } = useStudentProfile()

    // Set client flag to prevent hydration mismatch
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Load submitted modules from localStorage on mount (only on client)
    useEffect(() => {
        if (!isClient) return

        // Clear cached results to force fresh calculation (temporary fix for result calculation bug)
        const clearCache = localStorage.getItem('clear_practice_cache')
        if (clearCache === 'true') {
            console.log('🧹 Clearing cached practice results due to result calculation fix')
            localStorage.removeItem('submitted_practice_modules')
            // Clear all practice result cache entries
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith('practice_result_')) {
                    localStorage.removeItem(key)
                }
            }
            localStorage.removeItem('clear_practice_cache')
            return
        }

        const savedSubmittedModules = localStorage.getItem('submitted_practice_modules')
        if (savedSubmittedModules) {
            try {
                const modulesArray = JSON.parse(savedSubmittedModules)
                setSubmittedModules(new Set(modulesArray))

                // Load results for each submitted module
                const resultsMap = new Map<string, SubmitAttemptResponse>()
                modulesArray.forEach((moduleId: string) => {
                    const resultData = localStorage.getItem(`practice_result_${moduleId}`)
                    if (resultData) {
                        try {
                            const result = JSON.parse(resultData)
                            resultsMap.set(moduleId, result)
                        } catch (e) {
                            console.error('Failed to parse result for module:', moduleId, e)
                        }
                    }
                })
                setModuleResults(resultsMap)
            } catch (e) {
                console.error('Failed to load submitted modules:', e)
            }
        }
    }, [isClient])

    // Filter modules based on search term, category, university, and branch
    const filteredModules = useMemo(() => {
        if (!allModules) return []

        let filtered = allModules.filter(module => !module.is_archived)

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(module => module.category === selectedCategory)
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase()
            filtered = filtered.filter(module =>
                module.title.toLowerCase().includes(searchLower) ||
                module.description?.toLowerCase().includes(searchLower) ||
                module.role.toLowerCase().includes(searchLower) ||
                module.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            )
        }

        // Filter by university and branch targeting
        filtered = filtered.filter(module => {
            // If manual filters are applied, use them instead of automatic profile-based filtering
            if (selectedUniversities.length > 0 || selectedBranches.length > 0) {
                // Manual university filter
                const manualUniversityMatch =
                    selectedUniversities.length === 0 || // No university filter selected
                    module.target_all_colleges || // Admin selected "All Universities"
                    selectedUniversities.some(uniId => module.target_college_ids?.includes(uniId)) // Selected university is in targeted list

                // Manual branch filter
                const manualBranchMatch =
                    selectedBranches.length === 0 || // No branch filter selected
                    module.target_all_branches || // Admin selected "All Branches"
                    selectedBranches.some(branch => module.target_branch_ids?.includes(branch)) // Selected branch is in targeted list

                return manualUniversityMatch && manualBranchMatch
            } else {
                // Use automatic filtering based on student's profile
                const universityMatch =
                    module.target_all_colleges || // Admin selected "All Universities"
                    (profile?.institution && module.target_college_ids?.includes(profile.institution)) // Student's university is in the targeted list

                const branchMatch =
                    module.target_all_branches || // Admin selected "All Branches"
                    (profile?.branch && module.target_branch_ids?.includes(profile.branch)) // Student's branch is in the targeted list

                // Debug logging
                if (process.env.NODE_ENV === 'development') {
                    console.log(`Module: ${module.title}`, {
                        target_all_colleges: module.target_all_colleges,
                        target_college_ids: module.target_college_ids,
                        target_all_branches: module.target_all_branches,
                        target_branch_ids: module.target_branch_ids,
                        student_institution: profile?.institution,
                        student_branch: profile?.branch,
                        universityMatch,
                        branchMatch,
                        finalMatch: universityMatch && branchMatch
                    })
                }

                return universityMatch && branchMatch
            }
        })

        return filtered
    }, [allModules, selectedCategory, searchTerm, selectedUniversities, selectedBranches, profile])

    // Don't render until client is ready to prevent hydration mismatch
    if (!isClient) {
        return (
            <div className="space-y-6">
                <div className="space-y-4">
                    <LoadingSkeleton height="h-8" width="w-1/3" />
                    <LoadingSkeleton height="h-4" width="w-1/2" />
                </div>
                <StatsSkeleton count={3} />
                <CardSkeleton count={6} />
            </div>
        )
    }

    const handleStartExam = (module: PracticeModule) => {
        // Navigate to the practice module page with the module ID as a parameter
        router.push(`/dashboard/student/practice/${module.id}`)
    }

    const handleViewResults = (module: PracticeModule, result: SubmitAttemptResponse) => {
        // Show the results for a completed test
        setSelectedModule(module)
        setExamResult(result)
        setCurrentView('result')
    }

    const handleExamComplete = (result: SubmitAttemptResponse) => {
        setExamResult(result)
        // Redirect to dashboard instead of showing results
        setCurrentView('dashboard')

        // Track that this module has been submitted
        if (selectedModule) {
            setSubmittedModules(prev => new Set(prev).add(selectedModule.id))
            setModuleResults(prev => new Map(prev).set(selectedModule.id, result))

            // Save to localStorage for persistence
            const submittedModulesArray = Array.from(new Set([...Array.from(submittedModules), selectedModule.id]))
            localStorage.setItem('submitted_practice_modules', JSON.stringify(submittedModulesArray))
            localStorage.setItem(`practice_result_${selectedModule.id}`, JSON.stringify(result))
        }

        // Clear selected module to return to dashboard
        setSelectedModule(null)
    }

    const handleBackToDashboard = () => {
        setCurrentView('dashboard')
        setSelectedModule(null)
        setExamResult(null)
    }

    const handleBackToExam = () => {
        setCurrentView('exam')
        setExamResult(null)
    }

    const handleSearch = () => {
        // Search is handled by the filteredModules useMemo
        // This function can be used for additional search logic if needed
    }

    const handleClearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('all')
        setSelectedUniversities([])
        setSelectedBranches([])
    }

    if (currentView === 'exam' && selectedModule) {
        return (
            <PracticeExam
                module={selectedModule}
                onComplete={handleExamComplete}
                onBack={handleBackToDashboard}
            />
        )
    }

    if (currentView === 'result' && examResult) {
        return (
            <ResultReport
                result={examResult}
                module={selectedModule}
                onBackToDashboard={handleBackToDashboard}
                onBackToExam={handleBackToExam}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header - Consistent with StudentProfile style */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Practice Module 🧠
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                            Test your skills with practice assessments and mock exams to improve your performance ✨
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                🧠 Skill Development
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                🎯 Performance Tracking
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section - Updated with better styling */}
            <PracticeFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedUniversities={selectedUniversities}
                onUniversitiesChange={setSelectedUniversities}
                selectedBranches={selectedBranches}
                onBranchesChange={setSelectedBranches}
                onSearch={handleSearch}
                onClearFilters={handleClearFilters}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        label: 'Available Tests',
                        value: filteredModules.length.toString(),
                        icon: Brain,
                        color: 'text-blue-600',
                        bgColor: 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20',
                        borderColor: 'border-blue-200/50 dark:border-blue-700/50'
                    },
                    {
                        label: 'Total Questions',
                        value: filteredModules.reduce((sum, module) => sum + module.questions_count, 0).toString(),
                        icon: Clock,
                        color: 'text-green-600',
                        bgColor: 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20',
                        borderColor: 'border-green-200/50 dark:border-green-700/50'
                    },
                    {
                        label: 'Practice Areas',
                        value: new Set(filteredModules.map(m => m.role)).size.toString(),
                        icon: Trophy,
                        color: 'text-purple-600',
                        bgColor: 'bg-gradient-to-r from-purple-50/80 to-violet-50/80 dark:from-purple-900/20 dark:to-violet-900/20',
                        borderColor: 'border-purple-200/50 dark:border-purple-700/50'
                    }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="w-full"
                    >
                        <div className="block group w-full">
                            <div className={`p-4 rounded-xl border backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 w-full ${stat.bgColor} ${stat.borderColor}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                                            {isLoading ? (
                                                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 rounded"></div>
                                            ) : (
                                                stat.value
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-200">
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Practice Modules Grid */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Available Practice Tests
                    </h2>
                </div>
                <div className="p-6">
                    {isLoading ? (
                        <CardSkeleton count={6} />
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                            <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                                Error Loading Practice Modules
                            </h3>
                            <p className="text-red-700 dark:text-red-300">
                                {error instanceof Error ? error.message : 'Failed to load practice modules'}
                            </p>
                        </div>
                    ) : filteredModules.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredModules.map((module, index) => (
                                <motion.div
                                    key={module.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <PracticeCard
                                        module={module}
                                        onStart={() => handleStartExam(module)}
                                        onViewResults={() => {
                                            const result = moduleResults.get(module.id)
                                            if (result) {
                                                handleViewResults(module, result)
                                            }
                                        }}
                                        isSubmitted={submittedModules.has(module.id)}
                                        result={moduleResults.get(module.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
                            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {searchTerm || selectedCategory !== 'all'
                                    ? 'No Practice Modules Found'
                                    : 'No Practice Modules Available'
                                }
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {searchTerm || selectedCategory !== 'all'
                                    ? 'Try adjusting your search terms or filters to find more practice tests.'
                                    : 'Check back later for new practice tests and assessments.'
                                }
                            </p>
                            {(searchTerm || selectedCategory !== 'all') && (
                                <Button
                                    onClick={handleClearFilters}
                                    variant="outline"
                                    className="mt-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
