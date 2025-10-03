"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain, Clock, Users, Trophy, ArrowLeft, CalendarDays } from 'lucide-react'
import { PracticeCard } from './PracticeCard'
import { PracticeExam } from './PracticeExam'
import { ResultReport } from './ResultReport'
import { PracticeFilter, PracticeCategory } from './PracticeFilter'
import { usePracticeModules } from '@/hooks/usePractice'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { LoadingSkeleton, CardSkeleton, StatsSkeleton } from '@/components/ui/LoadingSkeleton'

type ViewState = 'dashboard' | 'exam' | 'result'

export function PracticeDashboard() {
    const [currentView, setCurrentView] = useState<ViewState>('dashboard')
    const [selectedModule, setSelectedModule] = useState<PracticeModule | null>(null)
    const [examResult, setExamResult] = useState<SubmitAttemptResponse | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<PracticeCategory>('all')
    const [submittedModules, setSubmittedModules] = useState<Set<string>>(new Set())
    const [moduleResults, setModuleResults] = useState<Map<string, SubmitAttemptResponse>>(new Map())
    const [isClient, setIsClient] = useState(false)
    
    const { data: allModules, isLoading, error } = usePracticeModules()

    // Set client flag to prevent hydration mismatch
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Load submitted modules from localStorage on mount (only on client)
    useEffect(() => {
        if (!isClient) return
        
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

    // Filter modules based on search term and category
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
        
        return filtered
    }, [allModules, selectedCategory, searchTerm])

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
        // Check if module has already been submitted
        if (submittedModules.has(module.id)) {
            // Show the result instead of starting the exam
            const result = moduleResults.get(module.id)
            if (result) {
                setExamResult(result)
                setSelectedModule(module)
                setCurrentView('result')
            }
            return
        }
        
        setSelectedModule(module)
        setCurrentView('exam')
    }

    const handleExamComplete = (result: SubmitAttemptResponse) => {
        setExamResult(result)
        setCurrentView('result')
        
        // Track that this module has been submitted
        if (selectedModule) {
            setSubmittedModules(prev => new Set(prev).add(selectedModule.id))
            setModuleResults(prev => new Map(prev).set(selectedModule.id, result))
            
            // Save to localStorage for persistence
            const submittedModulesArray = Array.from(new Set([...Array.from(submittedModules), selectedModule.id]))
            localStorage.setItem('submitted_practice_modules', JSON.stringify(submittedModulesArray))
            localStorage.setItem(`practice_result_${selectedModule.id}`, JSON.stringify(result))
        }
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
                module={selectedModule!}
                onBackToDashboard={handleBackToDashboard}
                onBackToExam={handleBackToExam}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Practice Module"
                description="Test your skills with practice assessments and mock exams to improve your performance"
                dateText={`${filteredModules.length} tests available`}
                tags={[
                    {
                        text: `${filteredModules.reduce((sum, module) => sum + module.questions_count, 0)} questions`,
                        icon: Brain,
                        colorClass: 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200'
                    },
                    {
                        text: `${new Set(filteredModules.map(m => m.role)).size} practice areas`,
                        icon: Trophy,
                        colorClass: 'bg-accent-green-100 dark:bg-accent-green-900/30 text-accent-green-800 dark:text-accent-green-200'
                    }
                ]}
            />

            {/* Filter Section */}
            <PracticeFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
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
                        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
                    },
                    {
                        label: 'Total Questions',
                        value: filteredModules.reduce((sum, module) => sum + module.questions_count, 0).toString(),
                        icon: Clock,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50 dark:bg-green-900/20'
                    },
                    {
                        label: 'Practice Areas',
                        value: new Set(filteredModules.map(m => m.role)).size.toString(),
                        icon: Trophy,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
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
                            <div className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full ${stat.bgColor}`}>
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
                                    <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Practice Modules Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        Available Practice Tests
                    </CardTitle>
                </CardHeader>
                <CardContent>
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
                                        isSubmitted={submittedModules.has(module.id)}
                                        result={moduleResults.get(module.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
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
                                    className="mt-4"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
